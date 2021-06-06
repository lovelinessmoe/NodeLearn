var selected;
var ids;
var isChecked;
var searcherItems;
var ignore;
//1 销户 2暂停 3恢复 4解绑
var operatorType;

var wait;
var _isShow = false;

$(document).ready(function () {
    $("input[name='refundType']").click(function () {

        var refundType = $(this).val();
        if (refundType == '0') {
            $("#cleanBalanceTxt").css("color", "gray");
            $("#refundBalanceAmount").attr("disabled", false);
        } else {
            $("#cleanBalanceTxt").css("color", "black");
            $("#refundBalanceAmount").attr("disabled", true);
        }

    });
})

//查看用户绑定信息
function findUserBindInfo(obj) {
    var $bindInfo = $(obj);
    var userUuid = $bindInfo.prop("id");
    $.ajax({
        type: 'post',
        url: USER_BINDINFO_URL + "?timestamp=" + new Date().getTime(),
        data: {"userUuid": userUuid},
        dataType: 'html',
        success: function (data) {
            $("#user_bindInfo_div").html(data);
            $("#bind_info_parent").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.clear();
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}


/**
 * 批量修改
 * 按钮点击事件
 * @param selected
 * @param ids
 */
function updateBatchUser(selected, ids, isChecked, searcherItems) {
    if (ids != "" && ids != null) {
        $("#userModelSearchform").attr("action", GO_BATCH_UPDATE_USER_URL);
        $("#ids").val(ids);
        $("#isChecked").val(isChecked);
        $("#searcherItems").val(searcherItems);
        $("#userModelSearchform").submit();
    } else {
        //alert("请在下面的列表中选择要处理的记录！");
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}


//处理销户,暂停，恢复,解绑
function doOperaAcion(doURL) {
    _isShow = true;
    $.ajax({
        type: 'post',
        url: doURL + "?timestamp=" + new Date().getTime(),
        data: {"ids": ids, "isChecked": isChecked, "searcherItems": searcherItems, "ignore": ignore},
        dataType: 'json',
        beforeSend: function () {
            $("#xiaohuDialog").modal("hide");
            $("#checkDeleteUserDialog").modal("hide");
            $("#stopDialog").modal("hide");
            $("#restoreDialog").modal("hide");
            $("#unbindingDialog").modal("hide");
            if (operatorType == 1) {
                wait = setInterval(readDeleteUserSchedule, 1000);
            } else if (operatorType == 2) {
                wait = setInterval(readStopUserSchedule, 1000);
            } else if (operatorType == 3) {
                wait = setInterval(readRestoreUserSchedule, 1000);
            } else if (operatorType == 4) {
                wait = setInterval(readUnbindUserSchedule, 1000);
            }
        },
        success: function (data) {
            closeReadSchedule();//关闭进度层 停止定时任务
            if (data.resultCode == 200) {
                toastr.success("处理完成!", "系统提示");
            } else if (data.resultCode == 300) {
                toastr.clear();
                toastr.warning(data.resultMsg, "系统提示");
            } else {
                toastr.clear();
                toastr.error(data.resultMsg, "系统提示");
            }
            var params = {
                silent: true,
                refresh: dataUrl
            };
            $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            closeReadSchedule();//关闭进度层 停止定时任务
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}


/**
 * 检查销户
 * 按钮点击事件
 * @param selected
 * @param ids
 */
function deleteBatchUser(selected, ids, isChecked, searcherItems) {
    operatorType = 1;
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#xiaohuDialog").modal("show");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}

function checkDeleteBatchUser() {
    $.ajax({
        type: 'post',
        url: CHECK_DELETE_USER_URL,
        data: {"selected": selected, "ids": ids, "isChecked": isChecked, "searcherItems": searcherItems},
        dataType: 'json',
        beforeSend: function () {
            _isShow = true;
            $("#xiaohuDialog").modal("hide");
            $("#user_operator_div").css("display", "table");
            wait = setInterval(readCheckDeleteSchedule, 500);
        },
        success: function (data) {
            closeReadSchedule();
            if (data.status == "-1") {
                toastr.error(data.msg);
            } else if (data.status == "0") {
                this.selected = selected;
                this.ids = ids;
                this.isChecked = isChecked;
                this.searcherItems = searcherItems;

                if (data.msg != null && data.msg != "") {
                    //有提示信息
                    $("#checkDeleteUserMsg").html(data.msg);
                    $("#checkDeleteUserDialog").modal("show");
                } else {
                    //无提示信息，直接执行
                    this.ignore = true;
                    doOperaAcion(GO_BATCH_DELETE_USER_URL);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            closeReadSchedule();
            toastr.clear();
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

function doBatchDeleteUser(ignore) {
    this.ignore = ignore;
    doOperaAcion(GO_BATCH_DELETE_USER_URL);
}


/**
 * 定时方法
 * 定时调用去读取进度
 */
function readCheckDeleteSchedule() {
    $.ajax({
        type: 'post',
        url: GET_CHECK_DELETE_SCHEDULE_URL,
        dataType: 'json',
        success: function (data) {
//			 if(_isShow){
//				 $("#authBuffer").attr("style","width:"+data.percentage+";");
//				 $("#authBufferMsg").html(data.percentage+" 已校验:"+data.currentNumber+" 总量:"+data.totalNumber);
//			 }
            if (_isShow) {
                if (data.currentNumber > 0) {
                    var current = parseInt((data.currentNumber / data.totalNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBuffer").html(data.percentage);
                    $("#authBufferMsg").html("已校验:" + data.currentNumber + " 总量:" + data.totalNumber);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

/**
 * 暂停
 * 按钮点击事件
 * @param selected
 * @param ids
 */
function stopBatchUser(selected, ids, isChecked, searcherItems) {
    operatorType = 2;
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#user_stop_div").css("display", "table");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}


/**
 * 恢复
 * 按钮点击事件
 * @param selected
 * @param ids
 */
function reStoreBatchUser(selected, ids, isChecked, searcherItems) {
    operatorType = 3;
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#restoreDialog").modal("show");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}

/**
 * 用户接触绑定信息
 * @param selected
 * @param ids
 */
function userUnBindingInfo(selected, ids, isChecked, searcherItems) {
    operatorType = 4;
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#unbindingDialog").modal("show");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}


/**
 * 销户
 */
function readDeleteUserSchedule() {
    $.ajax({
        type: 'post',
        url: BATCH_DO_SCHEDULE + "?timestamp=" + new Date().getTime(),
        dataType: 'json',
        data: {"operatorType": 1},
        success: function (data) {
            if (_isShow) {
                if (data.currentDeleteNumber > 0) {
                    var current = parseInt((data.currentDeleteNumber / data.deleteMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBuffer").html(data.percentage);
                    $("#authBufferMsg").html(data.percentage + " 已校验:" + data.currentDeleteNumber + " 总量:" + data.deleteMaxNumber + " " + data.errorMessage);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}


/**
 * 读取批量用户暂停进度
 */
function readStopUserSchedule() {
    $.ajax({
        type: 'post',
        url: BATCH_DO_SCHEDULE + "?timestamp=" + new Date().getTime(),
        dataType: 'json',
        data: {"operatorType": 2},
        success: function (data) {
            if (_isShow) {
                if (data.currentStopNumber > 0) {
                    $("#authBuffer").html(data.percentage);
                    var current = parseInt((data.currentStopNumber / data.stopMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBufferMsg").html("已处理:" + data.currentStopNumber + " 总量:" + data.stopMaxNumber + " " + data.errorMessage);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

function readRestoreUserSchedule() {
    $.ajax({
        type: 'post',
        url: BATCH_DO_SCHEDULE + "?timestamp=" + new Date().getTime(),
        dataType: 'json',
        data: {"operatorType": 3},
        success: function (data) {
            if (_isShow) {
                if (data.currentRestoreNumber > 0) {
                    $("#authBuffer").html(data.percentage);
                    var current = parseInt((data.currentRestoreNumber / data.restoreMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBufferMsg").html("已处理:" + data.currentRestoreNumber + " 总量:" + data.restoreMaxNumber + " " + data.errorMessage);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

/**
 * 批量解绑信息进度
 */
function readUnbindUserSchedule() {
    $.ajax({
        type: 'post',
        url: BATCH_DO_SCHEDULE + "?timestamp=" + new Date().getTime(),
        dataType: 'json',
        data: {"operatorType": 4},
        success: function (data) {
            if (_isShow) {
                if (data.currentUnbindNumber > 0) {
                    $("#authBuffer").html(data.percentage);
                    var current = parseInt((data.currentUnbindNumber / data.unBindMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBufferMsg").html("已处理:" + data.currentUnbindNumber + " 总量:" + data.unBindMaxNumber + " " + data.errorMessage);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

/**
 * 关闭进度层 停止定时任务
 */
function closeReadSchedule() {
    _isShow = false;
    $("#authBuffer").attr("class", "bar_box_style bar_1");
    $("#user_operator_div").hide();
    clearInterval(wait);
}


/**
 * 表格所需方法
 * @param params
 * @returns {___anonymous248_304}
 */
function queryParams(params) {
    return {
        limit: params.limit,
        offset: params.offset,
        search: params.search
    };
}


/**
 *通知
 */
//function sendNotice(selected,ids){
//     	if(ids!=""&&ids!=null){
//     		$("#userModelSearchform").attr("action",GO_SEND_NOTICE_URL);
//         	$("#ids").val(ids);
//         	$("#userModelSearchform").submit();
//     	}else{
//     		toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
//     	}
//}


/**
 * 查询所有显示的数据
 * json
 */
function findSearcherJsonData(url) {
    var templateData;
    $.ajax({
        type: 'post',
        async: false,
        url: url + "?timestamp=" + new Date().getTime(),
        dataType: 'json',
        success: function (data) {
            templateData = data;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
    return templateData;
}


//基本搜索项
function basicQueryItems(params) {


    return [
        {
            type: 'input',
            key: 'userName',
            placeholder: '用户名'
        },
        {
            label: '用户组：',
            type: 'list',
            key: "userGroupUuid",
            items: findSearcherJsonData(FIND_MANAGER_USERGROUP)
        },
        {
            label: '用户模板：',
            type: 'list',
            key: 'templateUuid',
            items: findSearcherJsonData(FIND_TEMPLATE_URL)
        }


    ]
}


//高级搜索项
function advancedQueryItems(params) {
    return [
        {
            label: '用户套餐：',
            type: 'list',
            key: 'internetPackageUuid',
            items: findSearcherJsonData(FIND_PACKAGE_URL)
        },
        {
            type: 'input',
            key: 'realName',
            label: '用户姓名：'
        },
        {
            label: '开户来源：',
            type: 'list',
            key: "userSource",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '普通开户'},
                {key: 2, value: '批量开户'},
                {key: 3, value: '导入开户'},
                {key: 5, value: '接口开户'},
                {key: 6, value: 'LDAP开户'},
                {key: 7, value: '注册审核开户'},
                {key: 8, value: '用户中心开户'},
                {key: 9, value: 'SAM开户'}
            ]
        },
        {
            label: '免接入控制：',
            type: 'list',
            key: "controllerValidate",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '需要校验'},
                {key: 2, value: '免校验'}
            ]
        }
        , {
            label: '用户状态：',
            type: 'list',
            key: "status",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '正常用户'},
                {key: 2, value: '暂停用户'}
            ]
        },
        {
            label: '是否实名：',
            type: 'list',
            key: "isRealNameAuth",
            items: [
                {key: "", value: '请选择'},
                {key: "true", value: '已实名'},
                {key: "false", value: '未实名'}
            ]
        },
        {
            label: '性别：',
            type: 'list',
            key: "sex",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '男'},
                {key: 2, value: '女'}
            ]
        },
        {
            type: 'input',
            key: 'email',
            label: '邮箱地址：'
        }
        , {
            label: '证件类型：',
            type: 'list',
            key: "certificateType",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '身份证'},
                {key: 2, value: '学生证'},
                {key: 3, value: '军官证'},
                {key: 4, value: '护照'},
                {key: 0, value: '其他'}
            ]
        },
        {
            type: 'input',
            key: 'certificateNo',
            label: '证件号码：'
        },
        {
            label: '文化程度：',
            type: 'list',
            key: "educationLevel",
            items: [
                {key: "", value: '请选择'},
                {key: 1, value: '小学'},
                {key: 2, value: '初中'},
                {key: 3, value: '高中'},
                {key: 4, value: '专科'},
                {key: 5, value: '本科'},
                {key: 6, value: '硕士'},
                {key: 7, value: '博士'},
                {key: 8, value: '博士后'},
                {key: 0, value: '其他'}
            ]
        }, {
            label: '用户类型：',
            type: 'list',
            key: "userTypeUuid",
            items: findSearcherJsonData(FIND_USER_TYPE_URL)
        },
        {
            type: 'input',
            key: 'phone',
            label: '电话号码：'
        },
        {
            type: 'input',
            key: 'mobile',
            label: '移动电话：'
        },
        {
            type: 'input',
            key: 'address',
            label: '住址：'
        },
        {
            type: 'input',
            key: 'zipCode',
            label: '邮政编码：'
        },
        {
            type: 'input',
            key: 'gatewayIPv4',
            label: '网关IPv4地址：'
        },
        {
            type: 'input',
            key: 'subnetMask',
            label: '子网掩码：'
        },
        {
            type: 'input',
            key: 'dns',
            label: '首选DNS：'
        },
        {
            type: 'input',
            key: 'bakDNS',
            label: '备用DNS：'
        }, {
            type: 'input',
            key: 'profession',
            label: '专业：'
        },
        {
            type: 'input',
            key: 'grade',
            label: '年级：'
        }, {
            type: 'input',
            key: 'college',
            label: '学院：'
        }, {
            type: 'input',
            key: 'departments',
            label: '院系：'
        },
        {
            label: '暂停时间范围：',
            type: 'dateRange',
            keyfrom: 'stopTime_TimeForm',
            keyto: "stopTime_TimeTo",
            connector: "到",
            newLine: true,
            placeholder: 'stopTime'
        },
        {
            label: '开户时间范围：',
            type: 'dateRange',
            keyfrom: 'createTime_TimeForm',
            keyto: "createTime_TimeTo",
            connector: "到",
            newLine: true,
            placeholder: 'createTime'
        },
        {
            label: '下次记账时间范围：',
            type: 'dateRange',
            keyfrom: 'nextCheckTime_TimeForm',
            keyto: "nextCheckTime_TimeTo",
            connector: "到",
            newLine: true,
            placeholder: 'nextCheckTime'
        },
        {
            label: '预销户时间范围：',
            type: 'dateRange',
            keyfrom: 'householdsTime_TimeForm',
            keyto: "householdsTime_TimeTo",
            connector: "到",
            newLine: true,
            placeholder: 'householdsTime'
        },
        {
            label: '是否预销户用户：',
            type: 'list',
            key: "isReadyDeleteUser",
            items: [
                {key: 'false', value: '否'},
                {key: 'true', value: '是'}
            ]
        }, {
            type: 'input',
            key: 'userNamePrefix',
            label: '用户名前缀：'
        },
        {
            type: 'textarea',
            key: 'batchUserName',
            label: '批量查询用户：'
        }


    ]
}

/**
 * 用户修改密码
 */
function updateUserPwd(selected, ids, isChecked, searcherItems) {
    $("#passWords").val("");
    $("#confirmPasswords").val("");
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#update_pwd_div").css("display", "table");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}


function closePwdDiv() {
    $("#update_pwd_div").hide();
};

function resetPwdDiv() {
    $("#passWords").val("");
    $("#confirmPasswords").val("");
}

function saveUserPwd() {
    var passWord = $("#passWords").val();
    var confirmPassword = $("#confirmPasswords").val();

    if (!checkisNotNull(passWord)) {
        toastr.error('请输入密码', '系统提示');
        return false;
    }

    if (passWord != confirmPassword) {
        toastr.error('两次密码输入不一致', '系统提示');
        return false;
    }
    $("#batchUpdateUserPwdrBtn").attr('disabled', "true");//设置为不可用 防止用户连续点击
    $.ajax({
        type: 'post',
        url: UPDATE_USER_PASSWORD,
        data: {
            "selected": selected,
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems,
            "passWord": passWord,
            "confirmPassword": confirmPassword
        },
        dataType: 'json',
        success: function (data) {
            $("#batchUpdateUserPwdrBtn").removeAttr("disabled");//设置为可用状态
            if (data.resultCode != 200) {
                toastr.error(data.resultMsg);
            } else {
                toastr.success("修改完成!");
                var params = {
                    silent: true,
                    refresh: dataUrl
                };
                $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
            }
            $("#update_pwd_div").hide();

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#batchUpdateUserPwdrBtn").removeAttr("disabled");//设置为可用状态
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });


}

function closeNewDiv(divId) {
    $("#" + divId).css("display", "none");
}

function sureBtn(divId) {
    $("#" + divId).hide();
    window.location.reload();
}


//购买套餐
function buyPackage(userUuid) {
    $.ajax({
        type: 'post',
        url: BUY_PACKAGE_URL + "?timestamp=" + new Date().getTime(),
        data: {"uniqueId": userUuid},
        dataType: 'html',
        success: function (data) {
            $("#buy_package_div").html(data);
            $("#buy_package_div_basic").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 修改用户
 * @param userUuid
 */
function updateUserInfo(userUuid) {
    $.ajax({
        type: 'post',
        url: UPDATE_USER_CUSTOM_URL + userUuid + "?timestamp=" + new Date().getTime(),
        dataType: 'html',
        success: function (data) {
            $("#update_user_div").html(data);
            $("#update_user_div_basic").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}


/**
 * 绑定运营商(html)
 */
function userBindOperator(userUuid) {
    $.ajax({
        type: 'post',
        url: USER_BIND_OPERATOR + "?timestamp=" + new Date().getTime(),
        data: {"userUuid": userUuid},
        dataType: 'html',
        success: function (data) {
            $("#user_bind_operator_div").html(data);
            $("#user_bind_operator_div_basic").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 处理用户绑定
 */
function doBindOperator(obj) {
    var formdata = $("#operatorUserBindForm").serialize();
    $(obj).attr('disabled', "true");//设置为不可用 防止用户连续点击
    $.ajax({
        type: 'post',
        url: DO_USER_BIND_INFO + "?timestamp=" + new Date().getTime(),
        data: formdata,
        dataType: 'json',
        success: function (data) {
            $(obj).removeAttr("disabled");//设置为可用状态
            if (data.resultCode == "200") {
                //绑定完成
                toastr.clear();
                toastr.success("绑定完成");
                $("#user_bind_operator_div_basic").hide();
            } else {
                toastr.clear();
                toastr.error(data.resultMsg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $(obj).removeAttr("disabled");//设置为可用状态
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

/**
 * 解绑运营商
 */
function userUnBindOperator(userUuid) {
    $.ajax({
        type: 'post',
        url: USER_UNBIND_OPERATOR + "?timestamp=" + new Date().getTime(),
        data: {"userUuid": userUuid},
        dataType: 'html',
        success: function (data) {
            $("#user_unbind_operator_div").html(data);
            $("#user_unbind_operator_div_basic").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 处理用户解绑(单个解绑)
 */
function unbindOperator(userUuid, operatorUuid, operatorUserName) {
    $.ajax({
        type: 'post',
        url: DO_USER_UN_BIND + "?timestamp=" + new Date().getTime(),
        data: {
            "userUuid": userUuid,
            "operatorUuid": operatorUuid,
            "operatorUserName": operatorUserName
        },
        dataType: 'json',
        success: function (data) {
            if (data.resultCode == "200") {
                //绑定完成
                toastr.clear();
                toastr.success("解绑完成!");
                userUnBindOperator(userUuid);
            } else {
                toastr.clear();
                toastr.error(data.resultMsg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

//查看用户运营商信息
function findUserOperatorInfo(obj) {
    var $bindInfo = $(obj);
    var userUuid = $bindInfo.prop("id");
    $.ajax({
        type: 'post',
        url: USER_UNBIND_OPERATOR + "?timestamp=" + new Date().getTime(),
        data: {"userUuid": userUuid, "showOpt": "true"},
        dataType: 'html',
        success: function (data) {
            $("#user_operator_info_div").html(data);
            $("#user_operator_info_div_basic").css("display", "table");
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.clear();
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

//大数据导出
function userBigDataExport(selected, ids, isChecked, searcherItems) {

    $.ajax({

        type: 'post',
        url: EXPORT_BIG_DATA + "?timestamp=" + new Date().getTime(),
        data: {"ids": ids, "isChecked": isChecked, "searcherItems": searcherItems},
        dataType: 'json',
        success: function (data) {
            if (data.resultCode == 200) {
                toastr.success("处理完成!", "已添加至导出任务队列");
            } else {
                toastr.error(data.resultMsg, "系统提示");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            flag = true;
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 批量暂停用户
 */
function batchStopUser() {
    var userStopReason = $("#userStopReason").val();
    if (userStopReason == null || userStopReason == "" || userStopReason.length == 0) {
        toastr.clear();
        toastr.error("请填写暂停原因.");
        return false;
    }
    $("#user_stop_div").hide();
    _isShow = true;
    $.ajax({
        type: 'post',
        url: GO_BATCH_STOP_USER_URL + "?timestamp=" + new Date().getTime(),
        data: {
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems,
            "ignore": ignore,
            "userStopReason": userStopReason
        },
        dataType: 'json',
        beforeSend: function () {
            wait = setInterval(readStopUserSchedule, 1000);
        },
        success: function (data) {
            closeReadSchedule();//关闭进度层 停止定时任务
            if (data.resultCode == 200) {
                toastr.success("处理完成!", "系统提示");
            } else if (data.resultCode == 300) {
                toastr.clear();
                toastr.warning(data.resultMsg, "系统提示");
            } else {
                toastr.clear();
                toastr.error(data.resultMsg, "系统提示");
            }
            var params = {
                silent: true,
                refresh: dataUrl
            };
            $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            closeReadSchedule();//关闭进度层 停止定时任务
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 批量对用户进行实名认证
 */
function updateUserRealName(selected, ids, isChecked, searcherItems) {
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#realNameDialog").modal("show");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}

function doUpdateUserRealName() {
    $("#realNameDialog").modal("hide");
    $.ajax({
        type: 'post',
        url: USER_REAL_NAME_AUTH_URL + "?timestamp=" + new Date().getTime(),
        data: {
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems
        },
        dataType: 'json',
        beforeSend: function () {
            _isShow = true;
            $("#user_operator_div").css("display", "table");
            wait = setInterval(readRealNameSchedule, 500);
        },
        success: function (data) {
            closeReadSchedule();
            if (data.resultCode == "200") {
                toastr.clear();
                toastr.success('处理成功!');
            } else {
                toastr.clear();
                toastr.error(data.resultMsg);
            }
            var params = {
                silent: true,
                refresh: dataUrl
            };
            $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            closeReadSchedule();
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 定时方法
 * 定时调用去读取进度
 */
function readRealNameSchedule() {
    $.ajax({
        type: 'post',
        url: USER_REAL_NAME_AUTH_SCH,
        dataType: 'json',
        success: function (data) {
            if (_isShow) {
                if (data.currentUpdateNumber > 0) {
                    var current = parseInt((data.currentUpdateNumber / data.updateMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBuffer").html(data.percentage);
                    $("#authBufferMsg").html("已处理用户:" + data.currentUpdateNumber + " 总量:" + data.updateMaxNumber);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}


/**
 * 批量对用户预销户
 */
function readyDeleteUser(selected, ids, isChecked, searcherItems) {
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#readyDeleteUserDi").modal("show");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}

function doReadyDeleteUser() {
    $("#readyDeleteUserDi").modal("hide");
    $.ajax({
        type: 'post',
        url: READY_DELETE_USER + "?timestamp=" + new Date().getTime(),
        data: {
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems
        },
        dataType: 'json',
        beforeSend: function () {
            _isShow = true;
            $("#user_operator_div").css("display", "table");
            wait = setInterval(readRealNameSchedule, 500);
        },
        success: function (data) {
            closeReadSchedule();
            if (data.resultCode == "200") {
                toastr.clear();
                toastr.success('处理成功!');
            } else if (data.resultCode == "202") {
                toastr.clear();
                toastr.error("主账号有正在使用的计费套餐，不能预销户");
            } else if (data.resultCode == "201") {
                toastr.clear();
                toastr.error("主账号有未使用的套餐，不能预销户");
            } else if (data.resultCode == "203") {
                toastr.clear();
                toastr.error("绑定的运营商账号有正在使用的计费套餐，不能预销户");
            } else if (data.resultCode == "204") {
                toastr.clear();
                toastr.error("绑定的运营商账号有未使用的套餐，不能预销户");
            } else {
                toastr.clear();
                toastr.error(data.resultMsg);
            }
            var params = {
                silent: true,
                refresh: dataUrl
            };
            $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            closeReadSchedule();
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}

/**
 * 余额退款
 * @param selected
 * @param ids
 * @param isChecked
 * @param searcherItems
 */
function refundBalance(selected, ids, isChecked, searcherItems) {
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#refund_balance_div").css("display", "table");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}

/**
 * 余额充值
 * @param selected
 * @param ids
 * @param isChecked
 * @param searcherItems
 */
function chargeBalance(selected, ids, isChecked, searcherItems) {
    if (ids != "" && ids != null) {
        this.selected = selected;
        this.ids = ids;
        this.isChecked = isChecked;
        this.searcherItems = searcherItems;
        $("#charge_balance_div").css("display", "table");
    } else {
        toastr.clear();
        toastr.warning('请在下面的列表中选择要处理的记录！', '系统提示');
    }
}


function readRefundBalanceSchedule() {
    $.ajax({
        type: 'post',
        url: REFUND_BALANCE_SCH,
        dataType: 'json',
        success: function (data) {
            if (_isShow) {
                if (data.refundBalanceCurrentNumber > 0) {
                    var current = parseInt((data.refundBalanceCurrentNumber / data.refundBalanceMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBuffer").html(data.percentage);
                    $("#authBufferMsg").html("已处理用户:" + data.refundBalanceCurrentNumber + " 总量:" + data.refundBalanceMaxNumber);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

function doRefundBalance() {

    if (checkRefundBalance()) {
        $("#refundBalanceBtn").attr('disabled', "true");
        var refundType = $("input[name='refundType']:checked").val();
        var refundBalance = $("#refundBalanceAmount").val();
        var refundsReason = $("#refundsReason").val();
        $.ajax({
            type: 'post',
            url: DO_REFUND_BALANCE + "?timestamp=" + new Date().getTime(),
            data: {
                "ids": ids,
                "isChecked": isChecked,
                "searcherItems": searcherItems,
                "refundType": refundType,
                "refundBalance": refundBalance,
                "refundsReason": refundsReason
            },
            dataType: 'json',
            beforeSend: function () {
                _isShow = true;
                $("#user_operator_div").css("display", "table");
                wait = setInterval(readRefundBalanceSchedule, 500);
                closeRefundBalanceDiv();
            },
            success: function (data) {
                closeRefundBalanceDiv();
                closeReadSchedule();
                $("#refundBalanceBtn").removeAttr("disabled");
                if (data.resultCode == "200") {
                    toastr.clear();
                    toastr.success('处理成功!');

                    if (data.showPrintPage) {

                        $("#refundBalancePrintDetailUserName").html(data.detail.userName);
                        $("#refundBalancePrintDetailRefundBalance").html(data.detail.refundBalance);
                        $("#refundBalancePrintDetailOriginalBalance").html(data.detail.originalBalance);
                        $("#refundBalancePrintDetailBalance").html(data.detail.balance);
                        $("#refundBalancePrintDetailOperator").html(data.detail.operator);
                        $("#refundBalancePrintDetailTime").html(data.detail.time);
                        $("#refundBalancePrintDetailRemark").html(data.detail.remark);
                        $("#refundBalancePrintDetailType").html(data.detail.type);

                        $("#refund_balance_print_detail_div").css("display", "table");
                    }

                } else {
                    toastr.clear();
                    toastr.error(data.resultMsg);
                }
                var params = {
                    silent: true,
                    refresh: dataUrl
                };
                $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $("#refundBalanceBtn").removeAttr("disabled");
                closeRefundBalanceDiv();
                closeReadSchedule();
                toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
            }
        });
    }
}

function checkRefundBalance() {

    var reason = $("#refundsReason").val();
    if (reason == '') {
        $("#refundsReasonError").show();
        return false;
    }

    var refundType = $("input[name='refundType']:checked").val();
    var refundBalance = $("#refundBalanceAmount").val();

    if (refundType == 0) {
        if (refundBalance == null || refundBalance == "" || refundBalance.length == 0) {
            toastr.error("退款金额不能为空!");
            return false;
        } else {
            var reg = /^\d+(\.\d+)?$/;
            if (!reg.test(refundBalance)) {
                toastr.error("退款金额输入不正确,请检查!");
                return false;
            }
        }
    }


    var result = true;
    $.ajax({
        type: 'post',
        url: CHECK_REFUND_BALANCE + "?timestamp=" + new Date().getTime(),
        data: {
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems,
            "refundType": refundType,
            "refundBalance": refundBalance
        },
        dataType: 'json',
        async: false,
        success: function (data) {
            console.log(data);
            if (data.resultCode != "200") {
                toastr.clear();
                toastr.error(data.resultMsg);
                result = false;
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });

    return result;

}


function closeRefundBalanceDiv() {
    $("#refund_balance_div").hide();
    resetRefundBalanceDiv()
};

function resetRefundBalanceDiv() {

    $("#refundsReason").val("");
    $("#refundBalanceAmount").val("");

}

function readChargeBalanceSchedule() {
    $.ajax({
        type: 'post',
        url: CHARGE_BALANCE_SCH,
        dataType: 'json',
        success: function (data) {
            if (_isShow) {
                if (data.chargeBalanceCurrentNumber > 0) {
                    var current = parseInt((data.chargeBalanceCurrentNumber / data.chargeBalanceMaxNumber) * 36);
                    $("#authBuffer").attr("class", "bar_box_style bar_" + current);
                    $("#authBuffer").html(data.percentage);
                    $("#authBufferMsg").html("已处理用户:" + data.refundBalanceCurrentNumber + " 总量:" + data.refundBalanceMaxNumber);
                } else {
                    $("#authBuffer").html("0%");
                    $("#authBufferMsg").html("正在等待处理请求...");
                }
                $("#user_operator_div").css("display", "table");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

function doChargeBalance() {

    if (checkChargeBalance()) {
        $("#chargeBalanceBtn").attr('disabled', "true");
        var chargeBalance = $("#chargeBalanceAmount").val();
        var chargeReason = $("#chargeReason").val();
        $.ajax({
            type: 'post',
            url: DO_CHARGE_BALANCE + "?timestamp=" + new Date().getTime(),
            data: {
                "ids": ids,
                "isChecked": isChecked,
                "searcherItems": searcherItems,
                "chargeBalance": chargeBalance,
                "chargeReason": chargeReason
            },
            dataType: 'json',
            beforeSend: function () {
                _isShow = true;
                $("#user_operator_div").css("display", "table");
                wait = setInterval(readChargeBalanceSchedule, 500);
                closeChargeBalanceDiv();
            },
            success: function (data) {
                closeChargeBalanceDiv();
                closeReadSchedule();
                $("#chargeBalanceBtn").removeAttr("disabled");
                if (data.resultCode == "200") {
                    toastr.clear();
                    toastr.success('处理成功!');

                    if (data.showPrintPage) {

                        $("#refundBalancePrintDetailUserName").html(data.detail.userName);
                        $("#refundBalancePrintDetailRefundBalance").html(data.detail.refundBalance);
                        $("#refundBalancePrintDetailOriginalBalance").html(data.detail.originalBalance);
                        $("#refundBalancePrintDetailBalance").html(data.detail.balance);
                        $("#refundBalancePrintDetailOperator").html(data.detail.operator);
                        $("#refundBalancePrintDetailTime").html(data.detail.time);
                        $("#refundBalancePrintDetailRemark").html(data.detail.remark);
                        $("#refundBalancePrintDetailType").html(data.detail.type);

                        $("#refund_balance_print_detail_div").css("display", "table");
                    }

                } else {
                    toastr.clear();
                    toastr.error(data.resultMsg);
                }
                var params = {
                    silent: true,
                    refresh: dataUrl
                };
                $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $("#refundBalanceBtn").removeAttr("disabled");
                closeChargeBalanceDiv();
                closeReadSchedule();
                toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
            }
        });
    }
}

function checkChargeBalance() {
    var amount = $("#chargeBalanceAmount").val();
    if (amount == null || amount == "" || amount.length == 0) {
        toastr.error("充值金额不能为空！");
        return false;
    }

    var reg = /^\d+(\.\d+)?$/;
    if (!reg.test(amount)) {
        toastr.error("充值金额输入不正确,请检查!");
        return false;
    }

    var reason = $("#chargeReason").val();
    if (reason == '') {
        $("#chargeReasonError").show();
        return false;
    }

    return true;
}

function closeChargeBalanceDiv() {
    $("#charge_balance_div").hide();
    resetChargeBalanceDiv()
};

function resetChargeBalanceDiv() {

    $("#chargeReason").val("");
    $("#chargeBalanceAmount").val("");

}


/**
 * 预销户转为普通用户
 * @param selected
 * @param ids
 * @param isChecked
 * @param searcherItems
 */
function readyDeleteUserToOrdinary(selected, ids, isChecked, searcherItems) {
    $.ajax({
        type: 'post',
        url: DELETE_TO_OR + "?timestamp=" + new Date().getTime(),
        data: {
            "ids": ids,
            "isChecked": isChecked,
            "searcherItems": searcherItems
        },
        dataType: 'json',
        success: function (data) {

            if (data.resultCode == "200") {
                toastr.clear();
                toastr.success('处理成功!');
            } else {
                toastr.clear();
                toastr.error(data.resultMsg);
            }
            var params = {
                silent: true,
                refresh: dataUrl
            };
            $('#ZZOS_USER_Table').bootstrapTable('refresh', params);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}
