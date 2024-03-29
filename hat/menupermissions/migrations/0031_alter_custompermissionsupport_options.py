# Generated by Django 3.2.13 on 2022-06-03 13:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("menupermissions", "0030_merge_20220518_1227"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="custompermissionsupport",
            options={
                "managed": False,
                "permissions": (
                    ("x_modifications", "Modifications"),
                    ("x_management_teams", "Equipes"),
                    ("x_management_users", "Utilisateurs"),
                    ("iaso_forms", "Formulaires"),
                    ("iaso_mappings", "Correspondances avec DHIS2"),
                    ("iaso_completeness", "Complétude des données"),
                    ("iaso_org_units", "Unités d'organisations"),
                    ("iaso_links", "Correspondances sources"),
                    ("iaso_users", "Utilisateurs"),
                    ("iaso_pages", "Pages"),
                    ("iaso_projects", "Projets"),
                    ("iaso_sources", "Sources"),
                    ("iaso_data_tasks", "Tâches"),
                    ("iaso_polio", "Polio"),
                    ("iaso_polio_config", "Polio config"),
                    ("iaso_submissions", "Soumissions"),
                    ("iaso_update_submission", "Editer soumissions"),
                    ("iaso_planning", "Planning"),
                    ("iaso_teams", "Equipes"),
                    ("iaso_assignments", "Attributions"),
                    ("iaso_polio_budget", "Budget Polio"),
                ),
            },
        ),
    ]
