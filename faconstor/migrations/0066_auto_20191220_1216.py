# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-12-20 12:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0065_remove_script_hosts_manage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hostsmanage',
            name='config',
            field=models.TextField(blank=True, default='', null=True, verbose_name='主机相关配置'),
        ),
        migrations.AlterField(
            model_name='process',
            name='config',
            field=models.TextField(blank=True, default='', null=True, verbose_name='XML格式存放预案变量/系统数据库信息'),
        ),
        migrations.AlterField(
            model_name='processrun',
            name='config',
            field=models.TextField(blank=True, default='', null=True, verbose_name='恢复变量/主机变量'),
        ),
    ]
