# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-12-20 11:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0064_auto_20191217_1755'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='script',
            name='hosts_manage',
        ),
    ]
