﻿$(document).ready(function () {
    $("#target").val("");
    var copy_priority_hidden = $("#copy_priority_hidden").val();
    $("#copy_priority").val(copy_priority_hidden);

    var db_open_hidden = $("#db_open_hidden").val();
    $("#db_open").val(db_open_hidden);

    function customProcessDataTable() {
        $('#sample_1').dataTable({
            "bAutoWidth": true,
            "bSort": false,
            "bProcessing": true,
            "ajax": "../oracle_restore_data/",
            "fnServerParams": function (aoData) {
                aoData.push({
                    name: "process_id",
                    value: $("#process_id").val()
                })
            },
            "columns": [
                {"data": "processrun_id"},
                {"data": "process_name"},
                {"data": "pri_host_ip"},
                {"data": "std_host_ip"},
                {"data": "createuser"},
                {"data": "state"},
                {"data": "run_reason"},
                {"data": "starttime"},
                {"data": "endtime"},
                {"data": "process_id"},
                {"data": "process_url"},
                {"data": null},
            ],
            "columnDefs": [{
                "targets": 1,
                "render": function (data, type, full) {
                    return full.state != "计划" ? "<td><a href='process_url' target='_blank'>data</a></td>".replace("data", full.process_name).replace("process_url", "/processindex/" + full.processrun_id + "?s=true") : "<td>" + full.process_name + "</td>"
                }
            }, {
                "visible": false,
                "targets": -2  // 倒数第一列
            }, {
                "visible": false,
                "targets": -3  // 倒数第一列
            }, {
                "targets": -1,  // 指定最后一列添加按钮；
                "data": null,
                "width": "100px",  // 指定列宽；
                "render": function (data, type, full) {
                    return "<td><button title='查看日志'  id='more_log' class='btn btn-xs btn-primary' type='button'><i class='fa fa-eye'></i></button><a href='/custom_pdf_report/?processrunid&processid'><button class='btn btn-xs btn-primary' type='button'><i class='fa fa-arrow-circle-down' style='color: white'></i></button></a><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button></td>".replace("processrunid", "processrunid=" + full.processrun_id).replace("processid", "processid=" + full.process_id)
                }
            }],

            "oLanguage": {
                "sLengthMenu": "&nbsp;&nbsp;每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉， 没有找到",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": '',
                "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                "sSearch": "搜索",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "前一页",
                    "sNext": "后一页",
                    "sLast": "尾页"
                },
                "sZeroRecords": "没有检索到数据",

            }
        });
        $('#sample_1 tbody').on('click', 'button#more_log', function () {
            var table = $('#sample_1').DataTable();
            var data = table.row($(this).parents('tr')).data();
            $.ajax({
                type: "POST",
                url: "../../more_log/",
                data:
                    {
                        processrun_id: data.processrun_id,
                    },
                success: function (data) {
                    if (data.ret == 1) {
                        var log_content = data.data;
                        // ..弹出模态框
                        $('#more_log_show').modal('show');
                        var content_el = $('#more_log_show').find('.modal-body');
                        var init = "";

                        init += log_content.ele_xml01 +
                            '<ul>\n' +
                            '    <li>开始时间：' + log_content.start_time + '</li>\n' +
                            '    <li>结束时间：' + log_content.end_time + '</li>\n' +
                            '    <li>源机IP：' + log_content.pri_host_ip + '</li>\n' +
                            '    <li>主机IP：' + log_content.std_host_ip + '</li>\n' +
                            '</ul>\n' +
                            log_content.ele_xml02;
                        var step_el = '<ul>';

                        if (log_content.step_info_list.length > 0) {
                            for (var i = 0; i < log_content.step_info_list.length; i++) {
                                step_el += '<li>  ' + log_content.step_info_list[i].step_name + '</li>\n' +
                                    '<li>&nbsp&nbsp 开始时间：' + log_content.step_info_list[i].start_time + '</li>\n' +
                                    '<li>&nbsp&nbsp 结束时间：' + log_content.step_info_list[i].end_time + '</li>\n';

                                if (log_content.step_info_list[i].script_list_wrapper > 0) {
                                    step_el += '<li>&nbsp&nbsp 接口：<ul>';
                                    for (var j = 0; j < log_content.step_info_list[i].script_list_wrapper.length; j++) {
                                        step_el += '<li>  ' + log_content.step_info_list[i].script_list_wrapper[j].script_name + '</li>\n' +
                                            '<li>&nbsp&nbsp 开始时间：' + log_content.step_info_list[i].script_list_wrapper[j].start_time + '</li>\n' +
                                            '<li>&nbsp&nbsp 结束时间：' + log_content.step_info_list[i].script_list_wrapper[j].end_time + '</li>\n' +
                                            '<li>&nbsp&nbsp 状态：' + log_content.step_info_list[i].script_list_wrapper[j].state + '</li>\n' +
                                            '<li>&nbsp&nbsp 脚本内容：<p>' + html_encode(log_content.step_info_list[i].script_list_wrapper[j].script_text) + '</p></li>\n' +
                                            '<li>&nbsp&nbsp 执行结果：<p>' + html_encode(log_content.step_info_list[i].script_list_wrapper[j].explain) + '</li>';
                                    }
                                    step_el += '</ul></li>';
                                }
                                step_el += '<ul>';
                                // 二级步骤
                                if (log_content.step_info_list[i].inner_step_list.length > 0) {
                                    for (var k = 0; k < log_content.step_info_list[i].inner_step_list.length; k++) {
                                        step_el += '<li>  ' + log_content.step_info_list[i].inner_step_list[k].step_name + '</li>\n' +
                                            '<li>&nbsp&nbsp 开始时间：' + log_content.step_info_list[i].inner_step_list[k].start_time + '</li>\n' +
                                            '<li>&nbsp&nbsp 结束时间：' + log_content.step_info_list[i].inner_step_list[k].end_time + '</li>\n' +
                                            '<li>&nbsp&nbsp 接口：<ul>';

                                        for (var l = 0; l < log_content.step_info_list[i].inner_step_list[k].script_list_inner.length; l++) {
                                            step_el += '<li>  ' + log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].script_name + '</li>\n' +
                                                '<li>&nbsp&nbsp 开始时间：' + log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].start_time + '</li>\n' +
                                                '<li>&nbsp&nbsp 结束时间：' + log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].end_time + '</li>\n' +
                                                '<li>&nbsp&nbsp 状态：' + log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].state + '</li>\n' +
                                                '<li>&nbsp&nbsp 脚本内容：<p>' + html_encode(log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].script_text) + '</p></li>\n' +
                                                '<li>&nbsp&nbsp 执行结果：<p>' + html_encode(log_content.step_info_list[i].inner_step_list[k].script_list_inner[l].explain) + '</li>';
                                        }
                                        step_el += '</ul></li>';
                                    }
                                }

                                step_el += '</ul>';
                            }
                            step_el += '</ul>';
                        }
                        init += step_el;
                        content_el.html(init);
                    } else
                        alert("加载日志失败，请于管理员联系。");
                },
                error: function (e) {
                    alert("加载日志失败，请于管理员联系。");
                }
            });

        });

        function html_encode(str) {
            var s = "";
            if (str == null || str == undefined){
                return ""
            };
            s = str.replace(/&/g, ">");
            s = s.replace(/</g, "<");
            s = s.replace(/>/g, ">");
            s = s.replace(/ /g, " ");
            s = s.replace(/\'/g, "'");
            s = s.replace(/\"/g, '"');
            s = s.replace(/\n/g, "<br>");
            return s;
        }

        $('#sample_1 tbody').on('click', 'button#delrow', function () {
            if (confirm("确定要删除该条数据？")) {
                var table = $('#sample_1').DataTable();
                var data = table.row($(this).parents('tr')).data();
                $.ajax({
                    type: "POST",
                    url: "../../delete_current_process_run/",
                    data:
                        {
                            processrun_id: data.processrun_id
                        },
                    success: function (data) {
                        if (data == 1) {
                            table.ajax.reload();
                            alert("删除成功！");
                        } else
                            alert("删除失败，请于管理员联系。");
                    },
                    error: function (e) {
                        alert("删除失败，请于管理员联系。");
                    }
                });

            }
        });
    }

    customProcessDataTable();

    $("#confirm").click(function () {
        $('#waiting_run').modal({backdrop: 'static', keyboard: false});
        var process_id = $("#process_id").val();

        var dialog_inputs = $('#config_edit_table thead').find('input');

        var all_text = $('#all_text').val();
        var new_all_text = "";
        // 重新构造配置文件
        for (var i = 0; i < dialog_inputs.length; i++) {
            var tmp_dialog = dialog_inputs[i].value;
            var tmp_dialog_id = dialog_inputs[i].id.split("_dialog")[0];

            var new_tmp_dialog = "";
            var all_config_edit_trs = $('#config_edit_tbody').find('tr');

            for (var j = 0; j < all_config_edit_trs.length; j++) {
                // var new_line_text = "";

                var cur_config_edit_tr = jQuery(all_config_edit_trs[j]);
                // 原行信息
                var line_text = cur_config_edit_tr.attr("line_text");
                var capacity = cur_config_edit_tr.attr("capacity");

                var space_td = cur_config_edit_tr.find('td:eq(0)').text().trim();

                // if (tmp_dialog.indexOf(space_td) != -1) {
                if (tmp_dialog_id == space_td) {
                    // 旧数据
                    var pre_config_td = cur_config_edit_tr.find('td:eq(1)').text().trim();
                    var pre_device_path = pre_config_td.split(" ")[0];
                    // var actual_capacity = pre_config_td.split(" ")[1];  //..

                    // 2048 pre_capacity
                    var pre_capacity = capacity;

                    // 新数据
                    var aft_device_path = cur_config_edit_tr.find('td:eq(2)').text().trim();
                    var aft_capacity = cur_config_edit_tr.find('td:eq(3)').text().trim();

                    // // 预设增量+原容量
                    // var c_aft_capacity = Number(actual_capacity.trim()) + Number(aft_capacity.trim());

                    var new_line_text = '';
                    // 当前tr的display为node的替换成空
                    if (cur_config_edit_tr.css('display') != "none") {
                        new_line_text = line_text.replace(pre_device_path, aft_device_path).replace(pre_capacity, aft_capacity).replace("DEVICE", "FILE");
                    }

                    // 替换段落内行数据
                    if (new_tmp_dialog) {
                        new_tmp_dialog = new_tmp_dialog.replace(line_text, new_line_text)
                    } else {
                        new_tmp_dialog = tmp_dialog.replace(line_text, new_line_text)
                    }
                }
            }
            if (new_all_text) {
                new_all_text = new_all_text.replace(tmp_dialog, new_tmp_dialog)
            } else {
                new_all_text = all_text.replace(tmp_dialog, new_tmp_dialog)
            }
        }
        // 非邀请流程启动
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../process_startup/",
            data: {
                processid: process_id,
                run_person: $("#run_person").val(),
                run_time: $("#run_time").val(),
                run_reason: $("#run_reason").val(),
                new_config: JSON.stringify(new_all_text),

                // 恢复变量
                select_time: $('#backupset_edt').val(),

                // 主机变量
                pri_host_id: $('#pri_host').val(),
                std_host_id: $('#std_host').val(),

                // 源机参数：db2.conf文件所需参数
                db_name: $('#db_name').val(),
                storage_policy: $('#storage_policy').val(),
                client_name: $('#client_name').val(),
                schedule_policy: $('#schedule_policy').val(),

                // 备机参数
                nbu_install_path: $('#nbu_install_path').val(),
                pre_increasement: $('#pre_increasement').val(),
                std_profile: $('#std_profile').val(),
                redirect_file_path: $('#redirect_file_path').val(),
                arch_log_path: $('#arch_log_path').val(),
            },
            success: function (data) {
                $('#waiting_run').modal('hide');
                if (data["res"] == "新增成功。") {
                    window.location.href = data["data"];
                } else
                    alert(data["res"]);
            },
            error: function (e) {
                $('#waiting_run').modal('hide');
                alert("流程启动失败，请于管理员联系。");
            }
        });
    });

    $("#confirm_invited").click(function () {
        var process_id = $("#process_id").val();
        var plan_process_run_id = $("#plan_process_run_id").val();
        // 需邀请流程启动
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../cv_oracle_run_invited/",
            data:
                {
                    processid: process_id,
                    plan_process_run_id: plan_process_run_id,
                    run_person: $("#runperson_invited").val(),
                    run_time: $("#runtime_invited").val(),
                    run_reason: $("#runreason_invited").val(),

                    target: $("#target_invited").val(),
                    recovery_time: $("#recovery_time_invited").val(),
                    browseJobId: $("#browseJobIdInvited").val(),
                    data_path: $("#data_path_invited").val(),

                    origin: $("#origin_invited").val()
                },
            success: function (data) {
                if (data["res"] == "新增成功。") {
                    window.location.href = data["data"];
                } else
                    alert(data["res"]);
            },
            error: function (e) {
                alert("流程启动失败，请于管理员联系。");
            }
        });
    });

    $("#run").click(function () {
        $("#static").modal({backdrop: "static"});
        $('#recovery_time').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            pickerPosition: 'top-right'
        });
        // 写入当前时间
        var myDate = new Date();
        $("#run_time").val(myDate.toLocaleString());

        $("#target").val("");

        $('#config_edit_div').hide();
    });

    $("#run_invited").click(function () {
        $("#static02").modal({backdrop: "static"});
        $('#recovery_time_invited').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            pickerPosition: 'top-right'
        });
        // 写入当前时间
        var myDate = new Date();
        $("#runtime_invited").val(myDate.toLocaleString());

        $("#target_invited").val("")
    });

    $("#plan").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        $("#static01").modal({backdrop: "static"});
        if (plan_process_run_id != "" && plan_process_run_id != null) {
            $("#save_div").hide();
            $("#download_div").show();
            // 填充开始时间与结束时间
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: "../fill_with_invitation/",
                data:
                    {
                        plan_process_run_id: plan_process_run_id,
                    },
                success: function (data) {
                    $("#start_date").val(data.start_time);
                    $("#end_date").val(data.end_time);
                    $("#purpose").val(data.purpose);
                },
                error: function (e) {
                    alert("获取邀请函数据失败，请于管理员联系。");
                }
            });
        } else {
            $("#save_div").show();
            $("#download_div").hide();
        }
    });

    $("#generate").click(function () {
        var process_id = $("#process_id").val();
        var start_date = $("#start_date").val();
        var end_date = $("#end_date").val();
        var purpose = $("#purpose").val();
        if (start_date == "" || start_date == null) {
            alert("演练开始时间！");
        } else if (end_date == "" || end_date == null) {
            alert("演练结束时间！");
        } else {
            window.open('/invite/?process_id=' + process_id + '&start_date=' + start_date + '&end_date=' + end_date + '&purpose=' + purpose);
        }
    });

    $('#start_date').datetimepicker({
        autoclose: true,
        format: 'yyyy-mm-dd hh:ii',
    });
    $('#end_date').datetimepicker({
        autoclose: true,
        format: 'yyyy-mm-dd hh:ii',
    });

    // 保存邀请函
    $("#save_invitation").click(function () {
        var process_id = $("#process_id").val();
        var plan_process_run_id = $("#plan_process_run_id").val();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../save_invitation/",
            data:
                {
                    process_id: process_id,
                    plan_process_run_id: plan_process_run_id,
                    start_time: $("#start_date").val(),
                    end_time: $("#end_date").val(),
                    purpose: $("#purpose").val(),
                },
            success: function (data) {
                if (data["res"] == "流程计划成功，待开启流程。") {
                    $("#save_div").hide();
                    $("#download_div").show();
                    $("#plan_process_run_id").val(data["data"]);
                    $("#static01").modal("hide");
                    // $("#sample_1").DataTable().destroy();
                    // customProcessDataTable();
                    // window.location.href = "/"
                } else
                    alert(data["res"]);
            }
        });
    });

    // 取消计划流程
    $("#reject_invited").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        if (confirm("是否取消当前流程计划？")) {
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: "../reject_invited/",
                data:
                    {
                        plan_process_run_id: plan_process_run_id,
                    },
                success: function (data) {
                    alert(data["res"]);
                    if (data['res'] === "取消演练计划成功！") {
                        // 关闭模态框刷新表格
                        window.location.reload();
                    }
                }
            });
        }
    });


    // 修改计划流程
    $("#modify_invited").click(function () {
        $("#static03").modal({backdrop: "static"});
        $('#start_date_modify').datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
        });
        $('#end_date_modify').datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
        });
    });

    // 保存修改计划流程
    $("#save_modify_invitation").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../save_modify_invitation/",
            data:
                {
                    plan_process_run_id: plan_process_run_id,
                    start_date_modify: $("#start_date_modify").val(),
                    end_date_modify: $("#end_date_modify").val(),
                    purpose_modify: $("#purpose_modify").val(),
                },
            success: function (data) {
                if (data["res"] == "修改流程计划成功，待开启流程。") {
                    $("#save_div").hide();
                    $("#download_div").show();
                    $("#plan_process_run_id").val(data["data"]);
                    $("#static03").modal("hide");
                    $("#static01").modal("hide");
                } else
                    alert(data["res"]);
            }
        });
        $("#sample_1").DataTable().destroy();
        customProcessDataTable();
    });

    $("#recovery_time_redio_group").click(function () {
        if ($("input[name='recovery_time_redio']:checked").val() == 2) {
            $("#static04").modal({backdrop: "static"});
            var origin = $("#origin").val();
            var datatable = $("#backup_point").dataTable();
            datatable.fnClearTable(); //清空数据
            datatable.fnDestroy();
            $('#backup_point').dataTable({
                "bAutoWidth": true,
                "bProcessing": true,
                "bSort": false,
                "ajax": "../../oraclerecoverydata?clientName=" + origin,
                "columns": [
                    {"data": "jobId"},
                    {"data": "jobType"},
                    {"data": "Level"},
                    {"data": "StartTime"},
                    {"data": "LastTime"},
                    {"data": null},
                ],
                "columnDefs": [{
                    "targets": -1,
                    "data": null,
                    "defaultContent": "<button  id='select' title='选择'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-check'></i></button>"
                }],

                "oLanguage": {
                    "sLengthMenu": "&nbsp;&nbsp;每页显示 _MENU_ 条记录",
                    "sZeroRecords": "抱歉， 没有找到",
                    "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                    "sInfoEmpty": '',
                    "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "前一页",
                        "sNext": "后一页",
                        "sLast": "尾页"
                    },
                    "sZeroRecords": "没有检索到数据",

                }
            });
            $('#backup_point tbody').on('click', 'button#select', function () {
                var table = $('#backup_point').DataTable();
                var data = table.row($(this).parents('tr')).data();
                $("#recovery_time").val(data.LastTime);
                $("input[name='recovery_time_redio'][value='1']").prop("checked", false);
                $("input[name='recovery_time_redio'][value='2']").prop("checked", true);
                $("#browseJobId").val(data.jobId);

                $("#static04").modal("hide");

            });
        } else {
            $("#recovery_time").val("");
        }
    });

    $("#recovery_time_redio_group_invited").click(function () {
        if ($("input[name='recovery_time_redio_invited']:checked").val() == 2) {
            $("#static04").modal({backdrop: "static"});
            var origin = $("#origin_invited").val();
            var datatable = $("#backup_point").dataTable();
            datatable.fnClearTable(); //清空数据
            datatable.fnDestroy();
            $('#backup_point').dataTable({
                "bAutoWidth": true,
                "bProcessing": true,
                "bSort": false,
                "ajax": "../../oraclerecoverydata?clientName=" + origin,
                "columns": [
                    {"data": "jobId"},
                    {"data": "jobType"},
                    {"data": "Level"},
                    {"data": "StartTime"},
                    {"data": "LastTime"},
                    {"data": null},
                ],
                "columnDefs": [{
                    "targets": -1,
                    "data": null,
                    "defaultContent": "<button  id='select' title='选择'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-check'></i></button>"
                }],

                "oLanguage": {
                    "sLengthMenu": "&nbsp;&nbsp;每页显示 _MENU_ 条记录",
                    "sZeroRecords": "抱歉， 没有找到",
                    "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                    "sInfoEmpty": '',
                    "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "前一页",
                        "sNext": "后一页",
                        "sLast": "尾页"
                    },
                    "sZeroRecords": "没有检索到数据",

                }
            });
            $('#backup_point tbody').on('click', 'button#select', function () {
                var table = $('#backup_point').DataTable();
                var data = table.row($(this).parents('tr')).data();
                $("#recovery_time_invited").val(data.LastTime);
                $("input[name='recovery_time_redio_invited'][value='1']").prop("checked", false);
                $("input[name='recovery_time_redio_invited'][value='2']").prop("checked", true);
                $("#browseJobIdInvited").val(data.jobId);

                $("#static04").modal("hide");
            });
        } else {
            $("#recovery_time_invited").val("");
        }
    });

    // modal.show事件
    $("#static").on("shown.bs.modal", function (event) {
        $("#target").val($("#target_selected").val());
        $("#run_reason").val("");
        $("#recovery_time").val("");
        $('#db_name').val($('#pre_db_name').val());

        // 写入当前时间
        var myDate = new Date();
        $("#run_time").val(myDate.toLocaleString('zh', {hour12: false}));
        $("input[name='recovery_time_redio'][value='1']").prop("checked", true);
        $("input[name='recovery_time_redio'][value='2']").prop("checked", false);

        // 获取备份集: backupset_stt backupset_edt
        $("#backupset_edt").val(myDate.toLocaleString('zh', {hour12: false}));

        // 清空主机、备机
        $('#pri_host').val("");
        $('#std_host').val("");

        $('#pri').empty();
        $('#std').empty();

        $('#pri_host_type_display').val("");
        $('#std_host_type_display').val("");

        $('#run_div').hide();
        $('#load_backupset').parent().hide();
    });

    $('#backupset_edt').datetimepicker({
        autoclose: true,
        format: 'yyyy/mm/dd hh:ii:ss',
    });

    $("#static02").on("shown.bs.modal", function (event) {
        $("#target_invited").val($("#target_selected_invited").val());
        $("#runreason_invited").val("");
        $("#recovery_time_invited").val("");

        // 写入当前时间
        var myDate = new Date();
        $("#runtime_invited").val(myDate.toLocaleString());
        $("input[name='recovery_time_redio_invited'][value='1']").prop("checked", true);
        $("input[name='recovery_time_redio_invited'][value='2']").prop("checked", false);
    });

    $('#load_backupset').click(function () {
        $("#bst_static").modal("show");
        if ($('#bst_status').val() == "complete") {
            var table = $('#bks_dt').dataTable();
            table.api().ajax.url("../load_backupset/?process_id=" + $("#process_id").val() + "&backupset_edt=" + $("#backupset_edt").val() + "&std_id=" + $('#std_host').val() + "&pri_host=" + $('#pri_host option:selected').text().trim() + "&db_name=" + $('#db_name').val().trim() + "&nbu_install_path=" + $('#nbu_install_path').val().trim()).load();
        } else {
            $('#bst_status').val('');
            $('#bks_dt').dataTable({
                // "retrieve": true,
                "bAutoWidth": true,
                "bSort": false,
                "bProcessing": true,
                // 备机id
                "ajax": "../load_backupset/?process_id=" + $("#process_id").val() + "&backupset_edt=" + $("#backupset_edt").val() + "&std_id=" + $('#std_host').val() + "&pri_host=" + $('#pri_host option:selected').text().trim() + "&db_name=" + $('#db_name').val().trim() + "&nbu_install_path=" + $('#nbu_install_path').val().trim(),
                "columns": [
                    {"data": "id"},
                    {"data": "bks_time"},
                    {"data": null}
                ],
                "columnDefs": [{
                    "targets": -1,
                    "data": null,
                    "mRender": function (data, type, full) {
                        if (full.tag == "last") {
                            return "<button  id='select' class='btn btn-xs btn-primary' type='button'><i class='fa fa-check-circle'></i></button>";
                        } else {
                            return "<button  id='select' class='btn btn-xs btn-default' type='button'><i class='fa fa-check-circle'></i></button>";
                        }
                    }
                }],
                "oLanguage": {
                    "sLengthMenu": "每页显示 _MENU_ 条记录",
                    "sZeroRecords": "抱歉， 没有找到",
                    "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                    "sInfoEmpty": "没有数据",
                    "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                    "sSearch": "搜索",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "前一页",
                        "sNext": "后一页",
                        "sLast": "尾页"
                    },
                    "sZeroRecords": "没有检索到数据",

                },
                "initComplete": function (settings, json) {
                    $('#bst_status').val('complete');
                }
            });
        }


        $('#bks_dt tbody').on('click', 'button#select', function () {
            // var table = $('#bks_dt').DataTable();
            // var bcs_data = table.row($(this).parents('tr')).data();
            // 所有取btn-xs btn-default
            $('#bks_dt tbody').find("button").each(function () {
                $(this).prop('class', 'btn btn-xs btn-default');
            });
            $(this).prop('class', 'btn btn-xs btn-primary');
        });
    });

    // 确定选中
    $('#select_config').click(function () {
        // var table = $('#bks_dt').DataTable();
        // var bcs_data = table.row($(this).parents('tr')).data();
        var bcs_time = "";
        $('#bks_dt tbody').find("button").each(function () {
            if ($(this).prop('class') == 'btn btn-xs btn-primary') {
                bcs_time = $(this).parent().prev().text().trim();
                return
            }
        });

        var std_id = $('#std_host').val();
        $('#loadingModal').modal({backdrop: 'static', keyboard: false});
        // 选择之后，传入process_id/备份集时间 >> 生成/读取配置文件
        // 修改重定向路径/预设增量 >> 重新生成配置文件
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "../../set_rec_config/",
            data: {
                process_id: $('#process_id').val(),
                bcs_time: bcs_time,

                std_profile: $('#std_profile').val(),
                nbu_install_path: $('#nbu_install_path').val(),
                pre_increasement: $('#pre_increasement').val(),

                pri_host_id: $('#pri_host').val(),
                std_host_id: $('#std_host').val(),

                // 源机参数：db2.conf文件所需参数
                db_name: $('#db_name').val(),
                storage_policy: $('#storage_policy').val(),
                client_name: $('#client_name').val(),
                schedule_policy: $('#schedule_policy').val(),
                redirect_file_path: $('#redirect_file_path').val()
            },
            success: function (data) {
                $('#loadingModal').modal('hide');
                if (data.ret == 0) {
                    alert(data.data);
                } else {
                    // 生成配置表格>> 可修改
                    $('#config_edit_div').show();
                    $('#config_edit_table tbody').empty();
                    $('#all_text').val(data.data.all_text);
                    // $('#all_text').val(data.data.all_text.replace("\\r", "\r").replace("\\n", "\n"));

                    var pre_space_name_list = [];
                    var pre_space_name = '';

                    for (var i = 0; i < data.data.split_part_list.length; i++) {
                        $('#config_edit_table thead').append(
                            '<input type="text" id="' + data.data.split_part_list[i].space_name + '_dialog" name="' + data.data.split_part_list[i].space_name + '_dialog" value="' + data.data.split_part_list[i].space_dialog.replace("\\r", "\r").replace("\\n", "\n") + '" hidden>'
                        );

                        for (var j = 0; j < data.data.split_part_list[i].params_list.length; j++) {

                            var pre_file_size = Number(data.data.split_part_list[i].params_list[j].pre_increasement) + Number(data.data.split_part_list[i].params_list[j].actual_capacity);

                            // 第一个space_name >> pre_space_name_list添加有重复项的space_name
                            if (pre_space_name == data.data.split_part_list[i].space_name && pre_space_name_list.indexOf(data.data.split_part_list[i].space_name) == -1) {
                                pre_space_name_list.push(pre_space_name);
                            } else {
                                pre_space_name = data.data.split_part_list[i].space_name;
                            }

                            $('#config_edit_table tbody').append(
                                '<tr id="' + data.data.split_part_list[i].space_name + '" line_text="' + data.data.split_part_list[i].params_list[j].line_text + '" capacity="' + data.data.split_part_list[i].params_list[j].capacity + '">' +
                                '<td>' +
                                '&nbsp&nbsp' + data.data.split_part_list[i].space_name +
                                '</td>' +
                                '<td> ' + data.data.split_part_list[i].params_list[j].device_path + ' ' + data.data.split_part_list[i].params_list[j].actual_capacity + ' </td>' +
                                '<td class="hidden-xs"> ' + data.data.split_part_list[i].params_list[j].device_path + ' </td>' +
                                '<td> ' + pre_file_size + ' </td>' +
                                '<td>' +
                                '<a href="javascript:;" class="btn btn-outline btn-circle dark btn-sm black" name="edit_config">' +
                                '<i class="fa fa-edit"></i> 修改 </a>' +
                                '</td>' +
                                '</tr>'
                            );
                        }
                    }

                    // 重复项首个添加图案 '  <span><a href="javascript:;" title="合并" name="merge"><i class="fa fa-plus-square-o"></i></a></span>';fa fa-minus-square-o
                    $('#config_edit_table tbody').find('tr');
                    for (var i = 0; i < pre_space_name_list.length; i++) {
                        $('#config_edit_table tbody').find('tr[id="' + pre_space_name_list[i] + '"]:eq(0)').find('td:eq(0)').html('&nbsp&nbsp' + pre_space_name_list[i] + '  <span><a href="javascript:;" title="合并" name="merge"><i class="fa fa-minus-square-o"></i></a></span>');
                    }
                }
                // 加载成功后显示启动按钮
                $('#run_div').show();
            },
            error: function () {
                alert("页面出现错误，请于管理员联系。");
                $('#loadingModal').modal('hide');
            }
        });
        $('#bst_static').modal('hide');
    });

    // 合并
    $('#config_edit_table tbody').on('click', 'a[name="merge"]', function () {
        // 判断当前是合并还是分开
        var td_node = $(this).parent().parent();

        var merge_icon = td_node.find('i').prop('class');
        var space_name = td_node.text().trim();

        if (merge_icon == "fa fa-minus-square-o") {
            // 合并
            td_node.html('&nbsp&nbsp' + space_name + '  <span><a href="javascript:;" title="展开" name="merge"><i class="fa fa-plus-square-o"></i></a></span>');
            // 该节点后面的所有同space_name的节点都隐藏
            td_node.parent().nextAll().each(function () {
                if ($(this).find('td:eq(0)').text().trim() == space_name) {
                    $(this).css('display', "none");
                }
            });
        } else {
            // 拆分
            td_node.html('&nbsp&nbsp' + space_name + '  <span><a href="javascript:;" title="合并" name="merge"><i class="fa fa-minus-square-o"></i></a></span>');
            // 该节点后面的所有同space_name的节点都展示
            td_node.parent().nextAll().each(function () {
                if ($(this).find('td:eq(0)').text().trim() == space_name) {
                    $(this).css('display', "table-row");
                }
            });
        }
    });


    var direct_node = '',
        pre_increasement_node = "";

    // 选择修改
    $('#config_edit_table tbody').on('click', 'a[name="edit_config"]', function () {
        // 点击弹出模态框
        $('#config_static').modal('show');

        // 提取重定向路径与预设增量
        direct_node = $(this).parent().parent().find('td:eq(2)');
        pre_increasement_node = $(this).parent().parent().find('td:eq(3)');

        $('#redirect_path').val(direct_node.text().trim());
        $('#pre_increasement').val(pre_increasement_node.text().trim());
    });

    // 输入修改原tr下的数据
    $('#config_save').click(function () {
        if (direct_node && pre_increasement_node) {
            direct_node.text($('#redirect_path').val().trim());
            pre_increasement_node.text($('#pre_increasement').val().trim());
            $('#config_static').modal('hide');
        }
    });

    // 批量修改
    $('#batch_edit').click(function () {
        $('#patch_edit_static').modal('show');
    });

    $('#patch_edit_save').click(function () {
        var patch_edit_redirect_path = $('#patch_edit_redirect_path').val().trim();

        if (patch_edit_redirect_path.split("/").slice(-1) != "") {
            patch_edit_redirect_path = patch_edit_redirect_path + "/"
        }

        $('tbody#config_edit_tbody tr').each(function () {
            var c_patch_edit_redirect_path = ""

            // 拆分+拼接
            c_patch_edit_redirect_path = patch_edit_redirect_path + $(this).find('td:eq(2)').text().trim().split("/").slice(-1)

            $(this).find('td:eq(2)').text(c_patch_edit_redirect_path);
        });
        $('#patch_edit_static').modal('hide');
    });

    var param_list = JSON.parse($('#param_list').val());
    // 切换源备机，加载参数
    $('#pri_host').change(function () {
        $('#pri').empty();
        var pri_host_id = $(this).val();
        for (var i = 0; i < param_list.length; i++) {
            if (pri_host_id == param_list[i].host_id) {
                $('#pri_host_type_display').val(param_list[i].host_type_display);

                var host_config_list = param_list[i].host_config_list;
                for (var j = 0; j < host_config_list.length; j++) {
                    $('#pri').append('<div class="form-group">\n' +
                        '    <label class="col-md-4 control-label" style="padding-left: 0;">' + host_config_list[j].param_name + '</label>\n' +
                        '    <div class="col-md-8">\n' +
                        '        <input id="' + host_config_list[j].variable_name + '" type="text" name="' + host_config_list[j].variable_name + '" class="form-control"\n' +
                        '               value="' + host_config_list[j].param_value + '"\n' +
                        '               >\n' +
                        '        <div class="form-control-focus"></div>\n' +
                        '\n' +
                        '    </div>\n' +
                        '</div>');
                }
            }
        }
        load_backupset_display();
    });

    $('#std_host').change(function () {
        $('#std').empty();
        var std_host_id = $(this).val();
        for (var i = 0; i < param_list.length; i++) {
            if (std_host_id == param_list[i].host_id) {
                $('#std_host_type_display').val(param_list[i].host_type_display);

                var host_config_list = param_list[i].host_config_list;

                for (var j = 0; j < host_config_list.length; j++) {
                    $('#std').append('<div class="form-group">\n' +
                        '    <label class="col-md-4 control-label" style="padding-left: 0;">' + host_config_list[j].param_name + '</label>\n' +
                        '    <div class="col-md-8">\n' +
                        '        <input id="' + host_config_list[j].variable_name + '" type="text" name="' + host_config_list[j].variable_name + '" class="form-control"\n' +
                        '               value="' + host_config_list[j].param_value + '"\n' +
                        '               >\n' +
                        '        <div class="form-control-focus"></div>\n' +
                        '\n' +
                        '    </div>\n' +
                        '</div>');
                }
            }
        }
        load_backupset_display();
    });

    function load_backupset_display() {
        var pri_host_type_display = $('#pri_host_type_display').val();
        var std_host_type_display = $('#std_host_type_display').val();

        if (pri_host_type_display.indexOf("DB2") != -1 && std_host_type_display.indexOf("DB2") != -1) {
            $('#load_backupset').parent().show();
        } else {
            $('#load_backupset').parent().hide();
        }
    }
});
