# Generated by Django 3.2.15 on 2023-01-30 16:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0190_sourceversion_unique_number_data_source_version"),
    ]

    operations = [
        migrations.AddField(
            model_name="instance",
            name="form_version_id",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
