# Generated by Django 3.2.15 on 2022-10-25 13:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0173_storagedevice_org_unit"),
    ]

    operations = [
        migrations.AddField(
            model_name="storagelogentry",
            name="status",
            field=models.CharField(blank=True, choices=[("OK", "OK"), ("BLACKLISTED", "BLACKLISTED")], max_length=64),
        ),
        migrations.AddField(
            model_name="storagelogentry",
            name="status_reason",
            field=models.CharField(
                blank=True,
                choices=[
                    ("STOLEN", "STOLEN"),
                    ("LOST", "LOST"),
                    ("DAMAGED", "DAMAGED"),
                    ("ABUSE", "ABUSE"),
                    ("OTHER", "OTHER"),
                ],
                max_length=64,
            ),
        ),
    ]