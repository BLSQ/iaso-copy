# Generated by Django 3.2.13 on 2022-07-25 14:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("polio", "0068_auto_20220712_0957"),
    ]

    operations = [
        migrations.AddField(
            model_name="budgetevent",
            name="amount",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True),
        ),
    ]
