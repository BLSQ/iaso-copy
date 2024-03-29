# Generated by Django 3.2.13 on 2022-06-03 13:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("polio", "0057_budgetevent_budgetfiles"),
    ]

    operations = [
        migrations.AddField(
            model_name="budgetevent",
            name="status",
            field=models.CharField(
                choices=[
                    ("validation_ongoing", "Validation Ongoing"),
                    ("validated", "Validated"),
                    ("refused", "Refused"),
                ],
                max_length=200,
                null=True,
            ),
        ),
    ]
