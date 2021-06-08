"""Exporting to a gpkg a whole Data source version (OrgUnit hierarchy and Groups) see README.md

"""
import sqlite3
from typing import Optional

import geopandas as gpd
from django.contrib.gis.geos import GEOSGeometry
from django.db.models import QuerySet
from pandas import DataFrame
from shapely import wkt
from shapely.geometry.base import BaseGeometry

from iaso.gpkg.import_gpkg import get_ref
from iaso.models import SourceVersion, OrgUnit

ORG_UNIT_COLUMNS = [
    "id",
    "name",
    "source_ref",
    "parent__name",
    "parent__source_ref",
    "parent__id",
    "parent__org_unit_type__name",
    "org_unit_type__name",
    "org_unit_type__depth",
    "uuid",
    "location",
    "geom",
    "simplified_geom",
]

OUT_COLUMNS = [
    "name",
    "ref",
    "geography",
    "parent",
    "parent_ref",
    "group_refs",
    "group_names",
    # "id", # it's present as  an index so it bug GeoPandas but it's exported
    "uuid",
]


def geos_to_shapely(geom: Optional[GEOSGeometry]) -> Optional[BaseGeometry]:
    # Pandas need a shapely geom because it need a object with __geo_interface__ for fiona
    if not geom:
        return None
    shape = wkt.loads(geom.wkt)
    return shape if not shape.is_empty else None


def export_org_units_to_gpkg(orgunits: "QuerySet[OrgUnit]", filepath) -> bytes:
    """Export the provided org unit queryset in GeoPackage (gpkg) format.

    The file may or may not exists.
    filter_empty_geom is for compat with the old api"""

    df = gpd.GeoDataFrame(orgunits.values(*ORG_UNIT_COLUMNS))

    # cleanup / transforms
    df = df.rename(
        columns={
            "org_unit_type__name": "type",
            "org_unit_type__depth": "depth",
        }
    )
    df["parent"] = df["parent__name"] + " (" + df["parent__org_unit_type__name"] + ")"
    # Calculate alternative parent ref if we have a parent
    df.loc[df["parent__id"].notnull(), "alt_parent_ref"] = df["parent__id"].apply("iaso#{:.0f}".format)
    # fill parent ref with alternative if we don't have one.
    df["parent_ref"] = df["parent__source_ref"].fillna(df["alt_parent_ref"])
    df["ref"] = df["source_ref"].fillna("iaso#" + df["id"].astype(str))
    df["geography"] = df["geom"].fillna(df["simplified_geom"].fillna(df["location"]))
    df["depth"] = df["depth"].fillna(999)
    df["depth"] = df["depth"].astype(int)
    df["type"] = df["type"].fillna("Unknown")

    # Convert django geometry values (GEOS) to shapely models
    df["geography"] = df["geography"].map(geos_to_shapely)

    # Add the groups the orgunit belong to.
    # values will return one line per orgunit - group combination
    # so we will need to aggregate them and join them with the orgunit df
    dg = DataFrame(orgunits.values("id", "groups__id", "groups__source_ref", "groups__name"))
    dg = dg.dropna(subset=["groups__id"])  # drop orgunit that have no groups
    dg = dg.set_index("id")
    # same as OrgUnit fill missing ref with artificial ref based on id
    dg["ref"] = dg["groups__source_ref"].fillna(dg["groups__id"].apply("iaso#{:.0f}".format))
    # drop the other columns
    dg = dg[["ref", "groups__name"]]
    # Aggregate so there is one line per orgunit, and value are in a nice str
    dog = dg[["ref", "groups__name"]].groupby("id").aggregate(lambda x: ", ".join(x))
    dog = dog.rename(columns={"groups__name": "group_names", "ref": "group_refs"})
    # Should produce a df like this  where index id is the OrgUnit.id=>
    #                                                group_refs                                        group_names
    # id
    # 367989  Oivhk4v2ZVC, f30c3dZKVHA, CmUdnSqK776, CzoGWyy...  CSI TYPE II, Rural, CSI+ CS + infirmerie, CSI ...
    # 367992  CmUdnSqK776, GXDIyF6Hq4m, CzoGWyy6fOl, qVyLsaa...  CSI+ CS + infirmerie, CSI TYPE  I, CSI + CS, P...
    # 368013                           KX9EuY75nGE, cLAexA2XA80                            HD, Groupe des Hopitaux
    # 368041  wHZQ5lPZobO, CmUdnSqK776, GXDIyF6Hq4m, CzoGWyy...  2017, CSI+ CS + infirmerie, CSI TYPE  I, CSI + CS

    # Now we join the OrgUnit df
    df = df.set_index("id")
    df = df.join(dog)

    # Convert to GeoDataframe, and group by org unit type
    # as we want one layer per OrgUnitType
    ou_gdf = gpd.GeoDataFrame(df, geometry="geography")
    ou_gdf["layer_name"] = "level-" + ou_gdf["depth"].astype(str) + "-" + ou_gdf["type"]

    ou_gdf_by_type = ou_gdf.groupby("layer_name")

    for layer_name, group in ou_gdf_by_type:
        # keep only the column we want to export and reorder them
        group = group[OUT_COLUMNS]
        # projection is hardcoded, but we use geography column
        group.to_file(filepath, driver="GPKG", layer=layer_name, crs="EPSG:4326")


CREATE_GROUPS_TABLE_QUERY = """create table groups
(
    fid  integer not null
        constraint groups_pk
            primary key autoincrement,
    ref  text    not null,
    name text    not null
);
"""

INSERT_TABLE_IN_GPKG_CONTENT = """
insert into gpkg_contents(table_name, data_type, identifier) values (
    'groups',
    'attributes',
    'groups'
)
"""


def add_group_in_gpkg(filepath: str, groups: "QuerySet[Group]"):
    """Create the table containing the groups and populate it.

    The gpkg must already exists
    also fill it in gpkg_contents as per spec"""
    with sqlite3.connect(filepath) as conn:
        cur = conn.cursor()
        cur.execute(CREATE_GROUPS_TABLE_QUERY)
        to_insert = [(get_ref(g), g.name) for g in groups.all()]
        cur.executemany("INSERT INTO groups(ref, name) values (?,?)", to_insert)
        cur.execute(INSERT_TABLE_IN_GPKG_CONTENT)


def export_source_gpkg(filepath: str, source: SourceVersion):
    """Export a whole source to a gpkg according to format in README.md"""
    org_units = source.orgunit_set.all()
    groups = source.group_set.all()
    export_org_units_to_gpkg(org_units, filepath)
    add_group_in_gpkg(filepath, groups)
