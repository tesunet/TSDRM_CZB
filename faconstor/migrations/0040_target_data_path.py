# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-09-25 13:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0039_processrun_origin'),
    ]

    operations = [
        migrations.AddField(
            model_name='target',
            name='data_path',
            field=models.CharField(blank=True, max_length=512, null=True, verbose_name='数据文件重定向路径'),
        ),
    ]