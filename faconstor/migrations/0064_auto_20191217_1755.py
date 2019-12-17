# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-12-17 17:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0063_auto_20191217_1352'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hostsmanage',
            name='host_type',
            field=models.IntegerField(blank=True, choices=[(1, 'DB2源机'), (2, 'DB2备机'), (3, 'Oracle源机'), (4, 'Oracle备机')], null=True, verbose_name='主机类型'),
        ),
    ]
