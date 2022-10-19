# Generated by Django 3.2.15 on 2022-10-10 14:50

from django.db import migrations, models
import plugins.polio.budget.models


class Migration(migrations.Migration):

    dependencies = [
        ("polio", "0099_rename_template_subject_mailtemplate_subject_template"),
    ]

    operations = [
        migrations.AlterField(
            model_name="mailtemplate",
            name="subject_template",
            field=models.TextField(
                default="{{author_name}} updated the the budget  for campaign {{campaign.obr_name}}",
                help_text="Template for the Email subject, use the Django Template language, see https://docs.djangoproject.com/en/4.1/ref/templates/language/ for reference. Please keep it as one line.",
                validators=[plugins.polio.budget.models.validator_template],
            ),
        ),
    ]
