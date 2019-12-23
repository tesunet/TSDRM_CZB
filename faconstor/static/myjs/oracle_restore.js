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


        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../oracle_process_startup/",
            data: {
                processid: process_id,
                run_person: $("#run_person").val(),
                run_time: $("#run_time").val(),
                run_reason: $("#run_reason").val(),


                // 恢复变量
                select_time: $('#backupset_edt').val(),

                // 主机变量
                pri_host_id: $('#pri_host').val(),
                std_host_id: $('#std_host').val(),

                // 源机参数：db2.conf文件所需参数
                db_name: $('#db_name').val(),
                client_name: $('#client_name').val(),
                master_name: $('#master_name').val(),

                // 备机参数
                nbu_install_path: $('#nbu_install_path').val(),
                redirect_path: $('#redirect_path').val(),
                oracle_user: $('#oracle_user').val(),

                //备份集
                backupsetname: $('#backupsetname').val(),

            },
            success: function (data) {
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
        $('#backupsetname').val();
        $('#backupsetname_div').hide();
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
            table.api().ajax.url("../load_oracle_backupset/?process_id=" + $("#process_id").val() + "&backupset_edt=" + $("#backupset_edt").val() + "&std_id=" + $('#std_host').val() + "&pri_host=" + $('#pri_host option:selected').text().trim() + "&db_name=" + $('#db_name').val().trim() + "&nbu_install_path=" + $('#nbu_install_path').val().trim()).load();
        } else {
            $('#bst_status').val('');
            $('#bks_dt').dataTable({
                // "retrieve": true,
                "bAutoWidth": true,
                "bSort": false,
                "bProcessing": true,
                // 备机id
                "ajax": "../load_oracle_backupset/?process_id=" + $("#process_id").val() + "&backupset_edt=" + $("#backupset_edt").val() + "&std_id=" + $('#std_host').val() + "&pri_host=" + $('#pri_host option:selected').text().trim() + "&db_name=" + $('#db_name').val().trim() + "&nbu_install_path=" + $('#nbu_install_path').val().trim(),
                "columns": [
                    {"data": "id"},
                    {"data": "bks_time"},
                    {"data": "tag"},
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
        $('#backupsetname').val(bcs_time);
        $('#backupsetname_div').show();
        if(bcs_time) {
            $('#run_div').show();
        }
        else{
            $('#run_div').hide();
        }


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

        if (pri_host_type_display.indexOf("Oracle") != -1 && std_host_type_display.indexOf("Oracle") != -1) {
            $('#load_backupset').parent().show();
        } else {
            $('#load_backupset').parent().hide();
        }
    }
});
