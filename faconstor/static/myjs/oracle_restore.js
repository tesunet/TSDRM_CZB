$(document).ready(function () {
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
                "width": "60px",  // 指定列宽；
                "render": function (data, type, full) {
                    return "<td><a href='/custom_pdf_report/?processrunid&processid'><button class='btn btn-xs btn-primary' type='button'><i class='fa fa-arrow-circle-down' style='color: white'></i></button></a><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button></td>".replace("processrunid", "processrunid=" + full.processrun_id).replace("processid", "processid=" + full.process_id)
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

            for (var j=0;j<all_config_edit_trs.length; j++){
                console.log('&&', j)
                var new_line_text = "";

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
                    var actual_capacity = pre_config_td.split(" ")[1];  //..

                    // 2048 pre_capacity
                    var pre_capacity = capacity;

                    // 新数据
                    var aft_device_path = cur_config_edit_tr.find('td:eq(2)').text().trim();
                    var aft_capacity = cur_config_edit_tr.find('td:eq(3)').text().trim();

                    // 预设增量+原容量
                    var c_aft_capacity = Number(actual_capacity.trim()) + Number(aft_capacity.trim());

                    if (new_line_text) {
                        new_line_text = new_line_text.replace(pre_device_path, aft_device_path).replace(pre_capacity, c_aft_capacity);
                    } else {
                        new_line_text = line_text.replace(pre_device_path, aft_device_path).replace(pre_capacity, c_aft_capacity);
                    }

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
            url: "../cv_oracle_run/",
            data:
                {
                    processid: process_id,
                    run_person: $("#run_person").val(),
                    run_time: $("#run_time").val(),
                    run_reason: $("#run_reason").val(),
                    new_config: JSON.stringify(new_all_text),
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

        // 写入当前时间
        var myDate = new Date();
        $("#run_time").val(myDate.toLocaleString('zh', { hour12: false }));
        $("input[name='recovery_time_redio'][value='1']").prop("checked", true);
        $("input[name='recovery_time_redio'][value='2']").prop("checked", false);

        // 获取备份集: backupset_stt backupset_edt
        $("#backupset_edt").val(myDate.toLocaleString('zh', { hour12: false }));
        // 默认30天前
        var backupset_stt = new Date(myDate - 1000 * 60 * 60 * 24 * 30);
        $("#backupset_stt").val(backupset_stt.toLocaleString('zh', { hour12: false }));

        var database = $('#database').val();
        if (database == "db2"){
            $('#load_backupset_div').show();
            $('#load_backupset').trigger('click');
        } else {
            $('#load_backupset_div').hide();
        }
    });

    $('#backupset_stt').datetimepicker({
        autoclose: true,
        minView: "month",
        format: 'yyyy/mm/dd hh:ii:ss',
    });
    $('#backupset_edt').datetimepicker({
        autoclose: true,
        minView: "month",
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

        $('#bks_dt').dataTable({
            "retrieve": true,
            "bAutoWidth": true,
            "bSort": false,
            "bProcessing": true,
            "ajax": "../load_backupset/?process_id=" + $("#process_id").val() + "&backupset_stt=" + $("#backupset_stt").val() + "&backupset_edt=" + $("#backupset_edt").val(),
            "columns": [
                { "data": "id" },
                { "data": "bks_time" },
                { "data": null }
            ],
            "columnDefs": [{
                "targets": -1,
                "data": null,
                "defaultContent": "<button  id='select' title='选择'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-check'></i></button>"
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

            }
        });
        $('#bks_dt tbody').on('click', 'button#select', function () {
            var table = $('#bks_dt').DataTable();
            var bcs_data = table.row($(this).parents('tr')).data();
            $('#loadingModal').modal({ backdrop: 'static', keyboard: false });
            // 选择之后，传入process_id/备份集时间 >> 生成/读取配置文件
            // 修改重定向路径/预设增量 >> 重新生成配置文件
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "../../set_rec_config/",
                data: {
                    process_id: $('#process_id').val(),
                    bcs_time: bcs_data.bks_time,
                },
                success: function (data) {
                    $('#loadingModal').modal('hide');
                    if (data.ret == 0) {
                        alert(data.data);
                    } else {
                        console.log(data)
                        // 生成配置表格>> 可修改
                        $('#config_edit_div').show();
                        $('#config_edit_table tbody').empty();
                        $('#all_text').val(data.data.all_text);
                        // $('#all_text').val(data.data.all_text.replace("\\r", "\r").replace("\\n", "\n"));
                        for (var i = 0; i < data.data.split_part_list.length; i++) {
                            $('#config_edit_table thead').append(
                                '<input type="text" id="' + data.data.split_part_list[i].space_name + '_dialog" name="' + data.data.split_part_list[i].space_name + '_dialog" value="' + data.data.split_part_list[i].space_dialog.replace("\\r", "\r").replace("\\n", "\n") + '" hidden>'
                            );

                            for (var j = 0; j < data.data.split_part_list[i].params_list.length; j++) {
                                $('#config_edit_table tbody').append(
                                    '<tr id="' + data.data.split_part_list[i].space_name + '" line_text="' + data.data.split_part_list[i].params_list[j].line_text + '" capacity="' + data.data.split_part_list[i].params_list[j].capacity +'">' +
                                    '<td>' +
                                    '<div class="success"></div>' +
                                    '&nbsp&nbsp' + data.data.split_part_list[i].space_name +
                                    '</td>' +
                                    '<td> ' + data.data.split_part_list[i].params_list[j].device_path + ' ' + data.data.split_part_list[i].params_list[j].actual_capacity + ' </td>' +
                                    '<td class="hidden-xs"> ' + data.data.split_part_list[i].params_list[j].device_path + ' </td>' +
                                    '<td> ' + data.data.split_part_list[i].params_list[j].pre_increasement + ' </td>' +
                                    '<td>' +
                                    '<a href="javascript:;" class="btn btn-outline btn-circle dark btn-sm black">' +
                                    '<i class="fa fa-edit"></i> 修改 </a>' +
                                    '</td>' +
                                    '</tr>'
                                );
                            }
                        }
                    }
                },
                error: function () {
                    alert("页面出现错误，请于管理员联系。");
                }
            });
            $('#bst_static').modal('hide');
        });
    });

    var direct_node = '',
        pre_increasement_node = "";

    // 选择修改
    $('#config_edit_table tbody').on('click', 'a', function () {
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
        var patch_edit_redirect_path = $('#patch_edit_redirect_path').val();

        $('tbody#config_edit_tbody tr').each(function () {
            $(this).find('td:eq(2)').text(patch_edit_redirect_path);
        });
        $('#patch_edit_static').modal('hide');
    });
});
