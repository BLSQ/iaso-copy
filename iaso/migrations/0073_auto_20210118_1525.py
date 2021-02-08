# Generated by Django 3.0.7 on 2021-01-18 15:25

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0072_auto_20210113_1251")]

    operations = [
        migrations.AddField(
            model_name="task",
            name="params",
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
        migrations.AddField(model_name="task", name="started_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(
            model_name="task",
            name="task_name",
            field=models.CharField(default="", max_length=40),
            preserve_default=False,
        ),
        migrations.AlterField(model_name="task", name="end_value", field=models.IntegerField(default=0)),
    ]