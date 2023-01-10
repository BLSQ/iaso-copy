# Generated by Django 3.2.15 on 2022-12-28 09:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("iaso", "0186_report_reportversion"),
    ]

    operations = [
        migrations.AddField(
            model_name="reportversion",
            name="status",
            field=models.CharField(
                choices=[("published", "Published"), ("unpublished", "Unpublished")],
                default="unpublished",
                max_length=255,
            ),
        ),
    ]
