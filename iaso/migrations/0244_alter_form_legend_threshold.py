# Generated by Django 3.2.21 on 2023-11-08 14:53

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("iaso", "0243_form_legend_threshold"),
    ]

    operations = [
        migrations.AlterField(
            model_name="form",
            name="legend_threshold",
            field=models.JSONField(blank=True, null=True),
        ),
    ]