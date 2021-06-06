$(document).ready(function () {

    $("#li_userInfo_set").addClass("menu_hov");
    /**
     * 个人设置切换
     */
    $("#all_info_li li").click(function () {
        var $li = $(this);
        var liId = $li.attr("id");
        //先移除li选中样式
        $("#all_info_li li").each(function () {
            $(this).removeClass("menuself_mod_hov");
        });


        //个人信息设置
        if (liId == "user_basic_info_li") {
            $("div[id^='user_']").hide();
            $("#user_basic_info").show();
            $li.addClass("menuself_mod_hov");
        }
        ;
        //终端绑定信息
        if (liId == "user_terminal_binding_info_li") {
            $("div[id^='user_']").hide();
            $("#user_terminal_binding_info").show();
            $li.addClass("menuself_mod_hov");
        }
        ;
        //修改密码
        if (liId == "user_password_info_li") {
            $("div[id^='user_']").hide();
            $("#user_password_info").show();
            $li.addClass("menuself_mod_hov");
        }
        ;

        if (liId == "user_real_name_li") {
            $("div[id^='user_']").hide();
            $("#user_real_name").show();
            $li.addClass("menuself_mod_hov");
        }
        ;

        if (liId == "user_mac_info_li") {
            $("div[id^='user_']").hide();
            $("#user_mac_binding_info").show();
            $li.addClass("menuself_mod_hov");
        }
        ;
        if (liId == "user_operator_info_li") {
            $("div[id^='user_']").hide();

            //查询运营商信息
            var userUuid = $("#userId").val();
            reloadUserOperatorInfo(userUuid);
            $li.addClass("menuself_mod_hov");
        }

        if (liId == "user_operator_password_info_li") {
            $("div[id^='user_']").hide();
            //查询运营商信息
            $("#user_operator_password_info").show();
            $li.addClass("menuself_mod_hov");
        }


    });

    //初始化切换的li
    if ($("#showFlag").val() == "true") {
        $("div[id^='user_']").hide();
        $("#user_terminal_binding_info").show();
        $("#user_terminal_binding_info_li").addClass("menuself_mod_hov");
    } else if ($("#showMac").val() == "true") {
        $("div[id^='user_']").hide();
        $("#user_mac_binding_info").show();
        $("#user_mac_info_li").addClass("menuself_mod_hov");
    } else {
        $("#user_basic_info_li").addClass("menuself_mod_hov");
    }

    //个人信息设置-保存密码
    $("#updateUserBasicInfoBtn").click(function () {
        //checked
        var email = $("#email").val();
        var zipCode = $("#zipCode").val();
        var mobile = $("#mobile").val();

        if (checkisNotNull(email)) {
            if (!checkEmail(email)) {
                $("#showErrorContent").html("邮箱地址输入错误!");
                $("#unbindingDialog").modal("show");
                return false;
            }
        }
        if (checkisNotNull(zipCode)) {
            if (!checkIsInteger(zipCode)) {
                $("#showErrorContent").html("邮政编码输入错误!");
                $("#unbindingDialog").modal("show");
                return false;
            }
        }
        if (checkisNotNull(mobile)) {
            if (!checkMobile(mobile)) {
                $("#showErrorContent").html("移动电话输入错误!");
                $("#unbindingDialog").modal("show");
                return false;
            }
        }

        //确认修改
        var formData = $("#userForm").serialize();
        $.ajax({
            type: 'post',
            url: USER_UPDATE_INFO_URL + "?timestamp=" + new Date().getTime(),
            data: formData,
            dataType: 'json',
            success: function (data) {
                if (data.resultCode == 200) {
                    $("#showErrorContent").html("个人信息设置完成.");
                    $("#unbindingDialog").modal("show");
                } else {
                    $("#showErrorContent").html(data.resultMsg);
                    $("#unbindingDialog").modal("show");
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
            }
        });

    });

    //密码设置
    $("#updateUserPwdInfoBtn").click(function () {
        var originalPassWord = $("#originalPassWord").val();
        var passWord = $("#passWord").val();
        var confirmPassword = $("#confirmPassword").val();
        if (!checkisNotNull(originalPassWord)) {
            $("#showErrorContent").html("请输入原密码!");
            $("#unbindingDialog").modal("show");
            return false;
        }

        if (!checkisNotNull(passWord)) {
            $("#showErrorContent").html("请输入新密码");
            $("#unbindingDialog").modal("show");
            return false;
        }

        if (passWord != confirmPassword) {
            $("#showErrorContent").html("两次密码输入不一致!");
            $("#unbindingDialog").modal("show");
            return false;
        }

        var formData = $("#userForm").serialize();
        $.ajax({
            type: 'post',
            url: USER_UPDATE_PWD_URL + "?timestamp=" + new Date().getTime(),
            data: formData,
            dataType: 'json',
            success: function (data) {
                if (data.resultCode == 200) {
                    $("#originalPassWord").val("");
                    $("#passWord").val("");
                    $("#confirmPassword").val("");
                    $("#showErrorContent").html("密码修改完成.");
                    $("#unbindingDialog").modal("show");
                } else {
                    $("#showErrorContent").html(data.resultMsg);
                    $("#unbindingDialog").modal("show");

                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
            }
        });

    });

    // 暂停/恢复切换
    $("#user_status_img").click(function () {

        var status = $("#status").val();
        if (status == 1) {
            $("#userStopReSpan").show();
            $("#status").val(2);
            $(this).attr("src", "../img/stop.png");
        }
        if (status == 2) {
            $("#status").val(1);
            $("#userStopReSpan").hide();
            $(this).attr("src", "../img/marnl.png");
        }
    });

    //解绑按钮css样式修改
    $("#bindingTable").find("td[name='releaseTime']").each(function () {
        var time = $(this).first().text();
        var compareDateStr = transcateDate(nowdate);
        if (compareDate(time, compareDateStr)) {
            $traget = $(this).parent().find("button").eq(0);
            if (!$traget.hasClass("but_no")) {
                $traget.addClass("but_yes");
            }

        } else {
            $(this).parent().find("button").eq(0).addClass("but_no");
            $(this).parent().find("button").eq(0).prop("disabled", true);
        }


    });
})

//解绑
function releaseThisRecord(prama) {
    var uuid = prama;
    $("#" + prama).attr("href", "#");
    //$(prama).prop("disabled",true);//防止重复提交
    $.ajax({
        type: 'post',
        url: USER_UNBIND_URL,
        data: "uuid=" + uuid,
        dataType: 'json',

        success: function (data) {

            if (data.resultCode == 200) {
                $("#showErrorContent2").html("解绑成功!");
                $("#unbindingDialog2").modal("show");
                return false;
            } else {

                $("#showErrorContent2").html(data.resultMsg);
                $("#unbindingDialog2").modal("show");
                return false;
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#showErrorContent2").html("系统处理出错了");
            $("#unbindingDialog2").modal("show");
            return false;
        }
    });
    return false;
}


function closeDiag3() {
    $("#unbindingDialog3").modal("hide");
}

//重新加载页面
function reloadThisPage() {
    window.location.href = USER_FORM_URL;
}

//改变用户的昵称
function changeNickName(prama) {

    var uuid = prama;//$(prama).parent().attr("name");
    //$(prama).prop("disabled",true);//防止重复提交
    if (uuid != null && uuid != "") {
        $("#setNickName").modal("show");
        $("#choosedUuid").val(uuid);
    }
    return false;
}


//取消按钮
function cancelOpetion() {
    $("#setNickName").modal("hide");
    var uuid = $("#choosedUuid").val();
    $("#choosedUuid").val("");//请空input框
    $("#inputNickName").val("");
    $("#bindingTable").find("button[name='" + uuid + "']").eq(1).prop("disabled", false);
}

//强制用户下线
function doOperaAcion() {
    var uuid = $("#choosedUuid").val();//请空input框
    var nickName = $("#inputNickName").val();
    if (nickName == null || nickName.length == 0) {
        $("#nickNameLackError").show()
        $("#nickNameLengthError").hide();
    } else if (nickName.length > 32) {
        $("#nickNameLackError").hide()
        $("#nickNameLengthError").show();

    } else {
        $("#nickNameLackError").hide();
        $("#nickNameLengthError").hide();

        $.ajax({

            type: 'post',
            url: CHANGE_NICKNAME_URL + "?timestamp=" + new Date().getTime(),
            data: {"uuid": uuid, "nickName": nickName},
            dataType: 'json',
            async: false,
            success: function (data) {
                $("#setNickName").modal("hide");
                $("#choosedUuid").val("");//请空input框
                $("#inputNickName").val("");
                if (data.resultCode == 200) {

                    $("#showErrorContent2").html("设备昵称设定成功!");
                    $("#unbindingDialog2").modal("show");
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


};


function reloadUserOperatorInfo(userUuid) {
    $.ajax({
        type: 'post',
        url: USER_OPERATOR_INFO + "?timestamp=" + new Date().getTime(),
        data: {"userUuid": userUuid},
        dataType: 'html',
        success: function (data) {
            $("#user_operator_binding_info").html(data);
            $("#user_operator_binding_info").show();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}


/**
 * 处理用户绑定
 */
function doBindOperator(obj) {
    var formdata = $("#userForm").serialize();
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
                window.location.reload();
            } else {
                $("#showErrorContent").html(data.resultMsg);
                $("#unbindingDialog").css("z-index", 99999999)
                $("#unbindingDialog").modal("show");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $(obj).removeAttr("disabled");//设置为可用状态
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}

/**
 * 处理用户解绑
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
                reloadUserOperatorInfo(userUuid);
            } else {
                $("#showErrorContent").html(data.resultMsg);
                $("#unbindingDialog").modal("show");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}


/**
 * 处理用户运营商帐号更改密码
 */
function doUpdateBindAllOperator() {
    var formdata = $("#userForm").serialize();
    $.ajax({
        type: 'post',
        url: USER_UPDATE_OP_INFO_URL + "?timestamp=" + new Date().getTime(),
        data: formdata,
        dataType: 'json',
        success: function (data) {
            if (data.resultCode == "200") {
                window.location.reload();
            } else {
                $("#showErrorContent").html(data.resultMsg);
                $("#unbindingDialog").modal("show");
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown);
        }
    });
}


/**
 * 显示绑定运营商div
 */
function showAddOperatorUser() {
    $("#self_bind_operator_div").css("display", "table");
}

/**
 * 关闭绑定运营商div
 */
function closeBindOperator() {
    $("#self_bind_operator_div").hide();
}

/**
 * 显示修改密码div
 */
function updateOperator(userUuid, operatorUserBindUuid, operatorUserName) {
    $("#self_update_operator_div").css("display", "table");
    $("#opt_name_span").html(operatorUserName);
    $("#operatorUserBindUuid").val(operatorUserBindUuid);

}

/**
 * 关闭修改密码div
 */
function closeUpdateOperator() {
    $("#passWords").val("");
    $("#confirmPasswords").val("");
    $("#operatorUserBindUuid").val("");
    $("#opt_name_span").html("");
    $("#self_update_operator_div").hide();
}

/**
 * 修改密码
 */
function doUpdateOperatorPwd() {

    var passWord = $("#passWords").val();
    var confirmPassword = $("#confirmPasswords").val();
    var operatorUserBindUuid = $("#operatorUserBindUuid").val();
    if (!checkisNotNull(passWord)) {
        $("#showErrorContent").html('请输入密码');
        $("#unbindingDialog").css("z-index", 99999999)
        $("#unbindingDialog").modal("show");
        return false;
    }
    if (passWord != confirmPassword) {
        $("#showErrorContent").html('两次密码输入不一致');
        $("#unbindingDialog").css("z-index", 99999999)
        $("#unbindingDialog").modal("show");
        return false;
    }
    $("#batchUpdateUserPwdrBtn").attr('disabled', "true");//设置为不可用 防止用户连续点击
    $.ajax({
        type: 'post',
        url: USER_UPDATE_OP_INFO_URL,
        data: {"passWord": passWord, "operatorUserBindUuid": operatorUserBindUuid},
        dataType: 'json',
        success: function (data) {
            $("#batchUpdateUserPwdrBtn").removeAttr("disabled");//设置为可用状态
            if (data.resultCode != 200) {
                $("#showErrorContent").html(data.resultMsg);
                $("#unbindingDialog").css("z-index", 99999999)
                $("#unbindingDialog").modal("show");
            } else {
                closeUpdateOperator();
                $("#showErrorContent").html('密码修改完成!');
                $("#unbindingDialog").css("z-index", 99999999)
                $("#unbindingDialog").modal("show");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#batchUpdateUserPwdrBtn").removeAttr("disabled");//设置为可用状态
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}


function isCardNo(cardNo) {
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (reg.test(card) === false) {
        alert("身份证输入不合法");
        return false;
    }
}


$(document).ready(function () {

    $("#realNameForm").bind("submit", function () {


        var f = document.getElementById("up_img_WU_FILE_0").files;
        var fileSize = (f[0].size / 1024) / 1024;
        if (fileSize > 1) {
            alert("文件不能超过1M");
            return false;
        }

        var f1 = document.getElementById("up_img_WU_FILE_1").files;
        var fileSize1 = (f1[0].size / 1024) / 1024;
        if (fileSize1 > 1) {
            alert("文件不能超过1M");
            return false;
        }

        var f2 = document.getElementById("up_img_WU_FILE_2").files;
        var fileSize2 = (f2[0].size / 1024) / 1024;
        if (fileSize2 > 1) {
            alert("文件不能超过1M");
            return false;
        }

        if (fileSize > 1) {
            alert("文件不能超过1M");
            return false;
        }


        /*var idCardRealName=$("#idCardRealName").val();
        var idCardNo=$("#idCardNo").val();
        if(idCardRealName==null||idCardRealName.length<=0){
            //console.log(" 请填写真实姓名");
            alert("真实姓名不能为空");
            return false;
        }
        if(idCardNo==null||idCardNo.length<=0){
            //console.log(" 请填写身份证号码");
            alert("身份证号码不能为空");
            return false;
        }*/
    })
})


//恢复
function updateOperatorStatusNormal(userBindUuid) {
    $.ajax({
        type: 'post',
        url: USER_OPERATOR_NORMAL,
        data: {"operatorUserBindUuid": userBindUuid},
        dataType: 'json',
        success: function (data) {
            if (data.resultCode != 200) {
                $("#showErrorContent_o").html(data.resultMsg);
                $("#unbindingDialog_o").css("z-index", 99999999)
                $("#unbindingDialog_o").modal("show");
            } else {
                $("#showErrorContent_o").html('恢复完成!');
                $("#unbindingDialog_o").css("z-index", 99999999)
                $("#unbindingDialog_o").modal("show");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });

}

//暂停
function updateOperatorStatusStop(userBindUuid) {
    $.ajax({
        type: 'post',
        url: USER_OPERATOR_STOP,
        data: {"operatorUserBindUuid": userBindUuid},
        dataType: 'json',
        success: function (data) {
            if (data.resultCode != 200) {
                $("#showErrorContent_o").html(data.resultMsg);
                $("#unbindingDialog_o").css("z-index", 99999999)
                $("#unbindingDialog_o").modal("show");
            } else {
                $("#showErrorContent_o").html('暂停完成!');
                $("#unbindingDialog_o").css("z-index", 99999999)
                $("#unbindingDialog_o").modal("show");
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            toastr.error(XMLHttpRequest + "=" + textStatus + "=" + errorThrown, "系统提示");
        }
    });
}
