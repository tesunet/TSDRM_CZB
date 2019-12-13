$(document).ready(function () {
    $('#sample_1').dataTable({
        "bAutoWidth": true,
        "bSort": false,
        "bProcessing": true,
        "ajax": "../process_data/",
        "columns": [
            { "data": "process_id" },
            { "data": "process_code" },
            { "data": "process_name" },
            { "data": "process_remark" },
            { "data": "process_sign" },
            { "data": "process_rto" },
            { "data": "process_rpo" },
            { "data": "process_sort" },
            // { "data": "process_color" },
            { "data": null }
        ],

        "columnDefs": [{
            "targets": 2,
            "render": function (data, type, full) {
                return "<td><a href='/processconfig/?process_id=processid'>data</a></td>".replace("processid", full.process_id).replace("data", full.process_name)
            }
        }, {
            "targets": 4,
            "render": function (data, type, full) {
                var process_sign = "否"
                if (full.process_sign == "1") {
                    var process_sign = "是"
                }
                return "<td>process_sign</td>".replace("process_sign", process_sign);
            }
        }, {
            "targets": -1,
            "data": null,
            "width": "100px",
            "defaultContent": "<button  id='edit' title='编辑' data-toggle='modal'  data-target='#static'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-edit'></i></button><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button>"
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
    // 行按钮
    $('#sample_1 tbody').on('click', 'button#delrow', function () {
        if (confirm("确定要删除该条数据？")) {
            var table = $('#sample_1').DataTable();
            var data = table.row($(this).parents('tr')).data();
            $.ajax({
                type: "POST",
                url: "../process_del/",
                data:
                {
                    id: data.process_id,
                },
                success: function (data) {
                    if (data == 1) {
                        table.ajax.reload();
                        alert("删除成功！");
                    }
                    else
                        alert("删除失败，请于管理员联系。");
                },
                error: function (e) {
                    alert("删除失败，请于管理员联系。");
                }
            });

        }
    });
    $('#sample_1 tbody').on('click', 'button#edit', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $("#id").val(data.process_id);
        $("#code").val(data.process_code);
        $("#name").val(data.process_name);
        $("#remark").val(data.process_remark);
        $("#sign").val(data.process_sign);
        $("#rto").val(data.process_rto);
        $("#rpo").val(data.process_rpo);
        $("#sort").val(data.process_sort);
        $("#process_color").val(data.process_color);

        $("#system").val(data.system);
        $("#database").val(data.database);
        
        // 参数信息      
        $('#param_se').empty();
        var config = JSON.parse(data.config);
        for (var i = 0; i < config.length; i++) {
            $('#param_se').append('<option value="' + config[i].variable_name + '">' + config[i].param_name + ': ' + config[i].param_value + '</option>');
        }

    });

    $("#new").click(function () {
        $("#id").val("0");
        $("#code").val("");
        $("#name").val("");
        $("#remark").val("");
        $("#sign").val("");
        $("#rto").val("");
        $("#rpo").val("");
        $("#sort").val("");
        $("#process_color").val("");

        $("#system").val("");
        $("#database").val("");

        $("#param_se").empty();
    });

    $('#save').click(function () {
        var table = $('#sample_1').DataTable();

        var params_list = []
        // 构造参数Map>> Array
        $('#param_se option').each(function () {
            // 构造单个参数信息
            var txt_param_list = $(this).text().split(":");
            var val_param = $(this).prop("value");
            var param_dict = {
                "param_name": txt_param_list[0],
                "variable_name": val_param,
                "param_value": txt_param_list[1]
            }
            params_list.push(param_dict)
        });

        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../process_save/",
            data: {
                id: $("#id").val(),
                code: $("#code").val(),
                name: $("#name").val(),
                remark: $("#remark").val(),
                sign: $("#sign").val(),
                rto: $("#rto").val(),
                rpo: $("#rpo").val(),
                sort: $("#sort").val(),
                color: $("#process_color").val(),

                system: $("#system").val(),
                database: $("#database").val(),
                // 重定向路径/目标机安装目录/源机器名/备机用户名/备机密码
                config: JSON.stringify(params_list)
            },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "保存成功。") {
                    $("#id").val(data["data"]);
                    $('#static').modal('hide');
                    table.ajax.reload();
                }
                alert(myres);
            },
            error: function (e) {
                alert("页面出现错误，请于管理员联系。");
            }
        });
    });

    $('#param_se').contextmenu({
        target: '#context-menu2',
        onItem: function (context, e) {
            if ($(e.target).text() == "新增") {
                $('#param_operate').val('new');

                // 清空所有子节点
                $('#params').empty();

                // 新增节点
                $("#params").append(
                    '<div class="form-group">' +
                    '<label class="col-md-2 control-label"><span style="color:red; "></span>参数名称</label>' +
                    '<div class="col-md-10">' +
                    '<input id="param_name" type="text" name="param_name" class="form-control" placeholder="">' +
                    '<div class="form-control-focus"></div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="col-md-2 control-label"><span style="color:red; "></span>变量设置</label>' +
                    '<div class="col-md-10">' +
                    '<input id="variable_name" type="text" name="variable_name" class="form-control" placeholder="">' +
                    '<div class="form-control-focus"></div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="col-md-2 control-label"><span style="color:red; "></span>参数值</label>' +
                    '<div class="col-md-10">' +
                    '<input id="param_value" type="text" name="param_value" class="form-control" placeholder="">' +
                    '<div class="form-control-focus"></div>' +
                    '</div>' +
                    '</div>'
                );

                $("button#param_edit").click();
            }
            if ($(e.target).text() == "修改") {
                $('#param_operate').val('edit');
                if ($("#param_se").find('option:selected').length == 0)
                    alert("请选择要修改的参数。");
                else {
                    if ($("#param_se").find('option:selected').length > 1)
                        alert("修改时请不要选择多条记录。");
                    else {
                        var alpha_param = $("#param_se").val();
                        var params_t = $("#param_se").find('option:selected').text();

                        var params_t_list = params_t.split(":");

                        var txt_param = params_t_list[0];
                        var v_param = params_t_list[1];

                        // $("#params").empty();
                        // $("#params").append(
                        //     '<div class="form-group">' +
                        //     '<label class="col-md-2 control-label"><span style="color:red; "></span>' + txt_param + '</label>' +
                        //     '<div class="col-md-10">' +
                        //     '<input id="' + alpha_param + '" type="text" name="' + alpha_param + '" value="' + v_param + '" class="form-control" placeholder="">' +
                        //     '<div class="form-control-focus"></div>' +
                        //     '</div>' +
                        //     '</div>'
                        // );
                        $("#params").empty();
                        $("#params").append(
                            '<div class="form-group">' +
                            '<label class="col-md-2 control-label"><span style="color:red; "></span>参数名称</label>' +
                            '<div class="col-md-10">' +
                            '<input id="param_name" type="text" name="param_name" value="' + txt_param + '" class="form-control" placeholder="">' +
                            '<div class="form-control-focus"></div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label class="col-md-2 control-label"><span style="color:red; "></span>变量设置</label>' +
                            '<div class="col-md-10">' +
                            '<input id="variable_name" type="text" name="variable_name" value="' + alpha_param + '" class="form-control" placeholder="">' +
                            '<div class="form-control-focus"></div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                            '<label class="col-md-2 control-label"><span style="color:red; "></span>参数值</label>' +
                            '<div class="col-md-10">' +
                            '<input id="param_value" type="text" name="param_value" value="' + v_param + '" class="form-control" placeholder="">' +
                            '<div class="form-control-focus"></div>' +
                            '</div>' +
                            '</div>'
                        );
                        $("button#param_edit").click();
                    }
                }

            } 
            if ($(e.target).text() == "删除") {
                $('#param_operate').val('delete');
                if ($("#param_se").find('option:selected').length == 0)
                    alert("请选择要删除的脚本。");
                else {
                    if (confirm("确定要删除该脚本吗？")) {
                        $("#param_se").find('option:selected').remove();
                    }
                }
            }

        }
    });

    $('#params_save').click(function () {
        var param_operate = $('#param_operate').val();
        var param_name = $('#param_name').val();
        var variable_name = $('#variable_name').val();
        var param_value = $('#param_value').val();
        if (param_operate == "new"){
            $('#param_se').append('<option value="' + variable_name + '">' + param_name + ': ' + param_value +'</option>');
        } 
        if (param_operate == "edit"){
            // 指定value的option修改text
            $('#param_se option[value="' + variable_name + '"]').text(param_name + ": " + param_value);
        }

        // var variable_name = $("#params").find("input").prop("id");
        // var param_name = $("#params").find("label").text();
        // var param_value = $("#params").find("input").val();

        // $('#param_se option[value="' + variable_name + '"]').text(param_name + ": " + param_value);
        $("#static01").modal("hide");
    });
});


