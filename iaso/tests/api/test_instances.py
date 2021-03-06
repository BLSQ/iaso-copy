import typing
from uuid import uuid4
from django.contrib.gis.geos import Point
from django.test import tag
from django.core.files import File
from unittest import mock

from hat.api.export_utils import timestamp_to_utc_datetime
from iaso import models as m
from iaso.test import APITestCase
from hat.audit.models import Modification


class InstancesAPITestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.star_wars = star_wars = m.Account.objects.create(name="Star Wars")

        sw_source = m.DataSource.objects.create(name="Galactic Empire")
        cls.sw_source = sw_source
        sw_version = m.SourceVersion.objects.create(data_source=sw_source, number=1)
        star_wars.default_version = sw_version
        star_wars.save()
        cls.sw_version = sw_version

        cls.yoda = cls.create_user_with_profile(username="yoda", account=star_wars, permissions=["iaso_submissions"])

        cls.jedi_council = m.OrgUnitType.objects.create(name="Jedi Council", short_name="Cnc")

        cls.jedi_council_corruscant = m.OrgUnit.objects.create(
            name="Coruscant Jedi Council", source_ref="jedi_council_corruscant_ref"
        )
        cls.jedi_council_endor = m.OrgUnit.objects.create(
            name="Endor Jedi Council", source_ref="jedi_council_endor_ref"
        )
        cls.jedi_council_endor_region = m.OrgUnit.objects.create(
            name="Endor Region Jedi Council", parent=cls.jedi_council_endor, source_ref="jedi_council_endor_region_ref"
        )

        cls.project = m.Project.objects.create(
            name="Hydroponic gardens", app_id="stars.empire.agriculture.hydroponics", account=star_wars
        )

        cls.form_1 = m.Form.objects.create(name="Hydroponics study", period_type=m.MONTH, single_per_period=True)

        cls.create_form_instance(
            form=cls.form_1, period="202001", org_unit=cls.jedi_council_corruscant, project=cls.project
        )
        cls.create_form_instance(
            form=cls.form_1, period="202002", org_unit=cls.jedi_council_corruscant, project=cls.project
        )
        cls.create_form_instance(
            form=cls.form_1, period="202002", org_unit=cls.jedi_council_corruscant, project=cls.project
        )
        cls.create_form_instance(
            form=cls.form_1, period="202003", org_unit=cls.jedi_council_corruscant, project=cls.project
        )

        cls.form_2 = m.Form.objects.create(
            name="Hydroponic public survey",
            form_id="sample2",
            device_field="deviceid",
            location_field="geoloc",
            period_type="QUARTER",
            single_per_period=True,
        )

        # Form without period
        cls.form_3 = m.Form.objects.create(
            name="Hydroponic public survey III",
            form_id="sample34",
            device_field="deviceid",
            location_field="geoloc",
            # period_type="QUARTER",
            # single_per_period=True,
        )

        cls.form_4 = m.Form.objects.create(
            name="Hydroponic public survey IV",
            form_id="sample26",
            device_field="deviceid",
            location_field="geoloc",
            period_type="QUARTER",
            single_per_period=True,
        )

        form_2_file_mock = mock.MagicMock(spec=File)
        form_2_file_mock.name = "test.xml"
        cls.form_2.form_versions.create(file=form_2_file_mock, version_id="2020022401")
        cls.form_2.org_unit_types.add(cls.jedi_council)
        cls.create_form_instance(
            form=cls.form_2, period="202001", org_unit=cls.jedi_council_corruscant, project=cls.project
        )
        cls.form_2.save()

        # Instance saved without period
        cls.form_3.form_versions.create(file=form_2_file_mock, version_id="2020022401")
        cls.form_3.org_unit_types.add(cls.jedi_council)
        cls.create_form_instance(form=cls.form_3, org_unit=cls.jedi_council_corruscant, project=cls.project)
        cls.form_3.save()

        # A deleted Instance
        cls.form_4.form_versions.create(file=form_2_file_mock, version_id="2020022402")
        cls.form_4.org_unit_types.add(cls.jedi_council)
        cls.create_form_instance(
            form=cls.form_4, period="2020Q1", org_unit=cls.jedi_council_corruscant, project=cls.project, deleted=True
        )
        cls.form_4.save()

        cls.project.unit_types.add(cls.jedi_council)
        cls.project.forms.add(cls.form_1)
        cls.project.forms.add(cls.form_2)
        cls.project.forms.add(cls.form_3)
        cls.project.forms.add(cls.form_4)
        sw_source.projects.add(cls.project)
        cls.project.save()

    def test_instance_list_by_form_id_permission_denied_when_anonymous(self):
        """GET /instances/?form_id=form_id"""
        instance = self.form_1.instances.first()
        response = self.client.get(f"/api/instances/{instance.pk}/")
        self.assertJSONResponse(response, 403)

    def test_instance_details_permission_denied_when_anonymous(self):
        """GET /instances/?form_id=form_id"""
        response = self.client.get(f"/api/instances/?form_id={self.form_1.pk}")
        self.assertJSONResponse(response, 403)

    def test_instance_create_anonymous(self):
        """POST /api/instances/ happy path (anonymous)"""

        instance_uuid = str(uuid4())
        body = [
            {
                "id": instance_uuid,
                "created_at": 1565258153704,
                "updated_at": 1565258153709,
                "orgUnitId": self.jedi_council_corruscant.id,
                "formId": self.form_1.id,
                "period": "202002",
                "latitude": 50.2,
                "longitude": 4.4,
                "accuracy": 10,
                "altitude": 100,
                "file": "\/storage\/emulated\/0\/odk\/instances\/RDC Collecte Data DPS_2_2019-08-08_11-54-46\/RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml",
                "name": "1",
            }
        ]
        response = self.client.post(
            f"/api/instances/?app_id=stars.empire.agriculture.hydroponics", data=body, format="json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertAPIImport("instance", request_body=body, has_problems=False)

        last_instance = m.Instance.objects.last()
        self.assertEqual(instance_uuid, last_instance.uuid)
        self.assertEquals("RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml", last_instance.file_name)
        self.assertEqual("202002", last_instance.period)
        self.assertIsInstance(last_instance.location, Point)
        self.assertEqual(10, last_instance.accuracy)
        self.assertEqual(4.4, last_instance.location.x)
        self.assertEqual(50.2, last_instance.location.y)
        self.assertEqual(self.jedi_council_corruscant, last_instance.org_unit)
        self.assertEqual(self.form_1, last_instance.form)
        self.assertEqual(timestamp_to_utc_datetime(1565258153704), last_instance.created_at)
        # TODO: the assertion below will fail because our API does not store properly the updated_at property
        # TODO: (See IA-278: https://bluesquare.atlassian.net/browse/IA-278)
        # self.assertEqual(
        #     timestamp_to_utc_datetime(1565258153709), last_instance.updated_at
        # )
        self.assertEqual(self.form_1, last_instance.form)
        self.assertIsNotNone(last_instance.project)

    def test_instance_create_pre_existing(self):
        """POST /api/instances/ with pre-existing, deleted instance"""

        instance_uuid = str(uuid4())
        pre_existing_instance = self.create_form_instance(
            form=self.form_1,
            name="Pre-existing name",
            period="202001",
            org_unit=self.jedi_council_corruscant,
            uuid=instance_uuid,
            deleted=True,
        )
        pre_existing_instance_count = m.Instance.objects.count()
        body = [
            {
                "id": instance_uuid,
                "latitude": 4.4,
                "created_at": 1565258153704,
                "updated_at": 1565258153704,
                "orgUnitId": self.jedi_council_corruscant.id,
                "formId": self.form_1.id,
                "longitude": 4.4,
                "accuracy": 10,
                "altitude": 100,
                "file": "\/storage\/emulated\/0\/odk\/instances\/RDC Collecte Data DPS_2_2019-08-08_11-54-46\/RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml",
                "name": "Mobile app name",
            }
        ]
        response = self.client.post(
            f"/api/instances/?app_id=stars.empire.agriculture.hydroponics", data=body, format="json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertAPIImport("instance", request_body=body, has_problems=False)

        self.assertEqual(pre_existing_instance_count, m.Instance.objects.count())  # No added instance
        pre_existing_instance.refresh_from_db()
        self.assertTrue(pre_existing_instance.deleted)
        self.assertEqual("Pre-existing name", pre_existing_instance.name)

    def test_instance_create_two_one_is_pre_existing(self):
        """POST /api/instances/ with one pre-existing instance and a new one"""

        instance_uuid = str(uuid4())
        pre_existing_instance = self.create_form_instance(
            form=self.form_1,
            name="Pre-existing name",
            period="202002",
            org_unit=self.jedi_council_corruscant,
            uuid=instance_uuid,
        )
        pre_existing_instance_count = m.Instance.objects.count()
        body = [
            {
                "id": str(uuid4()),
                "latitude": 4.4,
                "created_at": 1565258153704,
                "updated_at": 1565258153704,
                "orgUnitId": self.jedi_council_corruscant.id,
                "formId": self.form_1.id,
                "longitude": 4.4,
                "accuracy": 10,
                "altitude": 100,
                "file": "\/storage\/emulated\/0\/odk\/instances\/RDC Collecte Data DPS_2_2019-08-08_11-54-46\/RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml",
                "name": "Mobile app name i1",
            },
            {
                "id": instance_uuid,
                "latitude": 4.4,
                "created_at": 1565258153704,
                "updated_at": 1565258153704,
                "orgUnitId": self.jedi_council_corruscant.id,
                "formId": self.form_1.id,
                "longitude": 4.4,
                "accuracy": 10,
                "altitude": 100,
                "file": "\/storage\/emulated\/0\/odk\/instances\/RDC Collecte Data DPS_2_2019-08-08_11-54-46\/RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml",
                "name": "Mobile app name i2",
            },
        ]
        response = self.client.post(
            f"/api/instances/?app_id=stars.empire.agriculture.hydroponics", data=body, format="json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertAPIImport("instance", request_body=body, has_problems=False)

        self.assertEqual(pre_existing_instance_count + 1, m.Instance.objects.count())  # One added instance
        pre_existing_instance.refresh_from_db()
        self.assertEqual("Pre-existing name", pre_existing_instance.name)

    def test_instance_create_after_sync(self):
        """POST /api/instances/ with one pre-existing instance (created by the /sync view, with a filename only)"""

        instance_filename = "RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml"
        pre_existing_instance = self.create_form_instance(file_name=instance_filename)
        pre_existing_instance_count = m.Instance.objects.count()
        body = [
            {
                "id": str(uuid4()),
                "latitude": 4.4,
                "created_at": 1565258153704,
                "updated_at": 1565258153704,
                "orgUnitId": self.jedi_council_corruscant.id,
                "formId": self.form_1.id,
                "longitude": 4.4,
                "accuracy": 10,
                "altitude": 100,
                "file": "\/storage\/emulated\/0\/odk\/instances\/RDC Collecte Data DPS_2_2019-08-08_11-54-46\/RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml",
                "name": "Mobile app name",
            }
        ]
        response = self.client.post(
            f"/api/instances/?app_id=stars.empire.agriculture.hydroponics", data=body, format="json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertEqual(pre_existing_instance_count, m.Instance.objects.count())  # No-added instance
        pre_existing_instance.refresh_from_db()
        self.assertEqual("RDC Collecte Data DPS_2_2019-08-08_11-54-46.xml", pre_existing_instance.file_name)
        self.assertEqual("Mobile app name", pre_existing_instance.name)

    def test_instance_list_by_form_id_ok(self):
        """GET /instances/?form_id=form_id"""

        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/?form_id={self.form_1.pk}")
        self.assertJSONResponse(response, 200)

        self.assertValidInstanceListData(response.json(), 4)

    def test_instance_list_by_form_id_ok_soft_deleted(self):
        """GET /instances/?form_id=form_id"""

        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/?form_id={self.form_1.pk}")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 4)

        soft_deleted_instance = self.form_1.instances.first()
        soft_deleted_instance.deleted = True
        soft_deleted_instance.save()

        response = self.client.get(f"/api/instances/?form_id={self.form_1.pk}")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 3)

    def test_instance_details_by_id_ok_soft_deleted(self):
        """GET /instances/{instanceid}/"""

        soft_deleted_instance = self.form_1.instances.first()
        soft_deleted_instance.deleted = True
        soft_deleted_instance.save()

        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/{soft_deleted_instance.id}/")
        self.assertJSONResponse(response, 200)

    def test_soft_delete_an_instance(self):
        """DELETE /instances/{instanceid}/"""

        soft_deleted_instance = self.form_1.instances.first()

        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/{soft_deleted_instance.id}/")
        self.assertJSONResponse(response, 200)
        self.assertFalse(response.json()["deleted"])

        response = self.client.delete(f"/api/instances/{soft_deleted_instance.id}/")
        self.assertJSONResponse(response, 200)

        response = self.client.get(f"/api/instances/{soft_deleted_instance.id}/")
        self.assertJSONResponse(response, 200)
        self.assertTrue(response.json()["deleted"])

    def test_instance_list_by_form_id_and_status_ok(self):
        """GET /instances/?form_id=form_id&status="""
        self.client.force_authenticate(self.yoda)

        response = self.client.get(
            f"/api/instances/", {"form_id": self.form_1.id, "status": m.Instance.STATUS_DUPLICATED}
        )
        self.assertJSONResponse(response, 200)

        self.assertValidInstanceListData(response.json(), 2)

    def test_instance_list_by_search_org_unit_ref(self):
        """GET /instances/?search=refs:org_unit__source_ref"""
        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/", {"search": "refs:" + self.jedi_council_corruscant.source_ref})
        self.assertJSONResponse(response, 200)

        self.assertValidInstanceListData(response.json(), 6)

    def test_instance_list_by_search_org_unit_ref_not_found(self):
        """GET /instances/?search=refs:org_unit__source_ref"""
        self.client.force_authenticate(self.yoda)

        response = self.client.get(f"/api/instances/", {"search": "refs:source_ref_not_in"})
        self.assertJSONResponse(response, 200)

        self.assertValidInstanceListData(response.json(), 0)

    def test_instance_list_duplicate(self):
        """Regression test for IA-771
        Make duplicate instance, delete them. Check status for delete instance
        """
        self.client.force_authenticate(self.yoda)
        form = m.Form.objects.create(name="test", period_type=m.MONTH, single_per_period=True)
        form.projects.add(self.project)

        # create first submission, validate status is ready
        self.create_form_instance(
            form=form, period="202001", org_unit=self.jedi_council_corruscant, project=self.project
        )

        response = self.client.get(f"/api/instances/", {"form_id": form.id})
        res = self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(res, 1)
        self.assertEqual(res["instances"][0]["status"], "READY")
        # Create second submission, check status is duplicate
        dup = self.create_form_instance(
            form=form, period="202001", org_unit=self.jedi_council_corruscant, project=self.project
        )
        response = self.client.get(f"/api/instances/", {"form_id": form.id})
        res = self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(res, 2)
        self.assertEqual(res["instances"][0]["status"], "DUPLICATED")
        self.assertEqual(res["instances"][1]["status"], "DUPLICATED")
        # soft delete instance
        response = self.client.delete(f"/api/instances/{dup.id}/")
        self.assertEqual(response.status_code, 200)
        dup.refresh_from_db()
        self.assertEqual(True, dup.deleted)
        self.assertEqual(1, Modification.objects.count())
        # check status is ready again
        response = self.client.get(f"/api/instances/", {"form_id": form.id})

        response = self.client.get(f"/api/instances/", {"form_id": form.id})
        res = self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(res, 1)
        self.assertEqual(res["instances"][0]["status"], "READY")

    def assertValidInstanceListData(self, list_data: typing.Mapping, expected_length: int, paginated: bool = False):
        self.assertValidListData(
            list_data=list_data, expected_length=expected_length, results_key="instances", paginated=paginated
        )

        for instance_data in list_data["instances"]:
            self.assertValidInstanceData(instance_data)

    def assertValidInstanceData(self, instance_data: typing.Mapping):
        self.assertHasField(instance_data, "id", int)
        self.assertHasField(instance_data, "status", str)
        self.assertHasField(instance_data, "correlation_id", str, optional=True)

    def test_instance_patch_org_unit_period(self):
        """PATCH /instances/:pk"""
        self.client.force_authenticate(self.yoda)
        new_org_unit = m.OrgUnit.objects.create(
            name="Coruscant Jedi Council New New", version=self.sw_version, org_unit_type=self.jedi_council
        )
        instance_to_patch = self.form_2.instances.first()

        response = self.client.patch(
            f"/api/instances/{instance_to_patch.id}/",
            data={"org_unit": new_org_unit.id, "period": "2022Q1"},
            format="json",
            HTTP_ACCEPT="application/json",
        )

        self.assertJSONResponse(response, 200)

        instance_to_patch.refresh_from_db()
        self.assertEqual(instance_to_patch.org_unit, new_org_unit)
        self.assertEqual(instance_to_patch.period, "2022Q1")

        # assert audit log works
        modification = Modification.objects.last()
        self.assertEqual(self.yoda, modification.user)
        self.assertEqual("202001", modification.past_value[0]["fields"]["period"])
        self.assertEqual("2022Q1", modification.new_value[0]["fields"]["period"])
        self.assertEqual(self.jedi_council_corruscant.id, modification.past_value[0]["fields"]["org_unit"])
        self.assertEqual(new_org_unit.id, modification.new_value[0]["fields"]["org_unit"])
        self.assertEqual(instance_to_patch, modification.content_object)

    def test_instance_patch_org_unit(self):
        """PATCH /instances/:pk"""
        self.client.force_authenticate(self.yoda)
        new_org_unit = m.OrgUnit.objects.create(
            name="Coruscant Jedi Council Hospital", version=self.sw_version, org_unit_type=self.jedi_council
        )
        instance_to_patch = self.form_3.instances.first()

        response = self.client.patch(
            f"/api/instances/{instance_to_patch.id}/",
            data={"org_unit": new_org_unit.id},
            format="json",
            HTTP_ACCEPT="application/json",
        )

        self.assertJSONResponse(response, 200)

        instance_to_patch.refresh_from_db()
        self.assertEqual(instance_to_patch.org_unit, new_org_unit)
        self.assertEqual(instance_to_patch.period, None)

        # assert audit log works
        modification = Modification.objects.last()
        self.assertEqual(self.yoda, modification.user)
        self.assertEqual(None, modification.past_value[0]["fields"]["period"])
        self.assertEqual(None, modification.new_value[0]["fields"]["period"])
        self.assertEqual(self.jedi_council_corruscant.id, modification.past_value[0]["fields"]["org_unit"])
        self.assertEqual(new_org_unit.id, modification.new_value[0]["fields"]["org_unit"])
        self.assertEqual(instance_to_patch, modification.content_object)

    def test_instance_patch_restore(self):
        """PATCH /instances/:pk"""
        self.client.force_authenticate(self.yoda)

        instance_to_patch = self.form_4.instances.first()
        self.assertTrue(instance_to_patch.deleted)
        self.assertEqual(0, Modification.objects.count())
        response = self.client.patch(
            f"/api/instances/{instance_to_patch.id}/",
            data={"deleted": False},
            format="json",
            HTTP_ACCEPT="application/json",
        )

        self.assertJSONResponse(response, 200)

        self.assertEqual(1, Modification.objects.count())
        instance_to_patch.refresh_from_db()
        self.assertFalse(instance_to_patch.deleted)

        # assert audit log works
        modification = Modification.objects.last()
        self.assertEqual(self.yoda, modification.user)
        self.assertNotEquals(modification.past_value[0]["fields"]["deleted"], modification.content_object.deleted)
        self.assertEqual(instance_to_patch, modification.content_object)

    def test_can_retrieve_instances_in_csv_format(self):
        self.client.force_authenticate(self.yoda)
        response = self.client.get(f"/api/instances/?format=csv", headers={"Content-Type": "text/csv"})
        self.assertFileResponse(response, 200, "text/csv; charset=utf-8")

    def test_user_restriction(self):
        full = self.create_user_with_profile(username="full", account=self.star_wars, permissions=["iaso_submissions"])
        self.client.force_authenticate(full)
        self.create_form_instance(
            form=self.form_1, period="202001", org_unit=self.jedi_council_endor, project=self.project
        )
        self.create_form_instance(
            form=self.form_1, period="202001", org_unit=self.jedi_council_endor_region, project=self.project
        )
        # without org unit. #TODO will waiting for precision on the spec, we also filter them
        self.create_form_instance(form=self.form_1, period="202001", project=self.project)

        org_unit_without_submissions = m.OrgUnit.objects.create(name="org unit without submissions")

        # not restricted yet, can list all instances
        response = self.client.get(f"/api/instances/")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 9)
        # restrict user to endor region, can only see one instance. Not instance without org unit
        restricted = self.create_user_with_profile(
            username="restricted", account=self.star_wars, permissions=["iaso_submissions"]
        )
        restricted.iaso_profile.org_units.set([self.jedi_council_endor_region])
        restricted.iaso_profile.save()
        self.client.force_authenticate(restricted)

        response = self.client.get(f"/api/instances/")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 1)

        # restrict to parent region, should give one instance for parent and one for child
        restricted.iaso_profile.org_units.set([self.jedi_council_endor])
        restricted.iaso_profile.save()

        response = self.client.get(f"/api/instances/")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 2)

        # check with multiple orgunits. Return all submissions, except the empty one on the one on endor, and the one without orgunit
        restricted.iaso_profile.org_units.set(
            [self.jedi_council_endor_region, self.jedi_council_corruscant, org_unit_without_submissions]
        )
        restricted.iaso_profile.save()

        response = self.client.get(f"/api/instances/")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 7)

        # Check org unit without submissions return empty
        restricted.iaso_profile.org_units.set([org_unit_without_submissions])

        response = self.client.get(f"/api/instances/")
        self.assertJSONResponse(response, 200)
        self.assertValidInstanceListData(response.json(), 0)
