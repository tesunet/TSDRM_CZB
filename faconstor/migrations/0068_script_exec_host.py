# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-12-26 15:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0067_auto_20191220_1222'),
    ]

    operations = [
        migrations.AddField(
            model_name='script',
            name='exec_host',
            field=models.IntegerField(blank=True, choices=[(1, '源机'), (2, '备机')], default=2, null=True, verbose_name='执行主机'),
        ),
    ]