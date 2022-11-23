# Generated by Django 3.2.15 on 2022-11-23 10:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('iaso', '0179_workflow_workflowversion'),
    ]

    operations = [
        migrations.AddField(
            model_name='workflowversion',
            name='status',
            field=models.CharField(choices=[('D', 'Draft'), ('U', 'Unpublished'), ('P', 'Published')], default='D', max_length=2),
        ),
    ]
