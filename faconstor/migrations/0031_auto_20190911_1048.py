# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-09-11 10:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0030_auto_20190909_1518'),
    ]

    operations = [
        migrations.AddField(
            model_name='origin',
            name='os',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='系统'),
        ),
        migrations.AddField(
            model_name='target',
            name='os',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='系统'),
        ),
    ]