# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-10-28 16:53
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0049_processrun_copy_priority'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='target',
            name='data_path',
        ),
    ]
