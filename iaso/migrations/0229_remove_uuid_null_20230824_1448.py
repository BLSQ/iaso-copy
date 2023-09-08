# Generated by Django 3.2.15 on 2023-08-24 14:48

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ("iaso", "0228_populate_uuid_values_20230824_1448"),
    ]

    operations = [
        migrations.AlterField(
            model_name="workflow",
            name="uuid",
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
        migrations.AlterField(
            model_name="workflowversion",
            name="uuid",
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
