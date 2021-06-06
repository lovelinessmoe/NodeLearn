/**
 * 验证是否为IPv6地址
 * @param callback
 * @returns {Boolean}
 */
//function checIpv6(value) {
//	if(value.match(/:/g)==null){
//		return false;
//	}
//
//	return value.match(/:/g).length<=7
//	&&/::/.test(value)
//	?/^([\da-f]{1,4}(:|::)){1,6}[\da-f]{1,4}$/i.test(value)
//	:/^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(value);
//}

function checIpv6(value) {
    if (checkIpv4(value)) {
        return false;
    }
    var exp = /^\s*((([0-9A-Fa-f]{1,4}:){7}(([0-9A-Fa-f]{1,4})|:))|(([0-9A-Fa-f]{1,4}:){6}(:|((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})|(:[0-9A-Fa-f]{1,4})))|(([0-9A-Fa-f]{1,4}:){5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){0,1}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){0,2}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){0,3}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}:)(:[0-9A-Fa-f]{1,4}){0,4}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(:(:[0-9A-Fa-f]{1,4}){0,5}((:((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})?)|((:[0-9A-Fa-f]{1,4}){1,2})))|(((25[0-5]|2[0-4]\d|[01]?\d{1,2})(\.(25[0-5]|2[0-4]\d|[01]?\d{1,2})){3})))(%.+)?\s*$/;
    return exp.test(value);
}

/**
 *判断是否是仅由数字组成
 */
function checkIsInteger(value) {
    var exp = /^\+?[0-9]*$/;
    return exp.test(value);
}


/**
 * 验证是否为IPv4地址
 * @param callback
 * @returns {Boolean}
 */
function checkIpv4(value) {
    var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    return exp.test(value);
}

/**
 * 验证是否为DNS/ip地址
 * @param callback
 * @returns {Boolean}
 */
function checkDNS(value) {
    var exp = /([0-9]{1,3}\.{1}){3}[0-9]{1,3}/;
    return exp.test(value);
}

/**
 * 验证是否MAC地址
 * @param value
 * @returns {Boolean}
 */
function checkMac(value) {
    //var macs = new Array();
    //macs = value.split(":");
    //if(macs.length != 6){
    //	return false;
    //}
    //
    //for (var s=0; s<6; s++) {
    //	if(macs[s].length==2) {
    //		var temp = parseInt(macs[s], 16);
    //		if (isNaN(temp)) {
    //			return false;
    //		}
    //		if (temp < 0 || temp > 255) {
    //			return false;
    //		}
    //	}else{
    //		return false;
    //	}
    //}
    //return true;

    var exp = /[A-Fa-f0-9]{12}$/;
    if (exp.test(value)) {
        return true;

    }
    return false;

}


/**
 * 不需要添加:-等符号的mac地址验证
 * @param value
 * @returns
 */
function checkBindingInfoMac(value) {
    var exp = /[A-Fa-f0-9]{12}/;
    return exp.test(value);
}


/**
 * 验证值是否在两个数之间
 * @param value
 * @param min
 * @param max
 * @returns {Boolean}
 */
function checkNumberMinMax(value, min, max) {
    if (isNaN(value)) {
        return false;
    }
    if (value < min || value > max) {
        return false;
    }
    return true;
}

/**
 * 验证一个字符串是否为空''
 * @param value
 * @returns {Boolean}
 */
function checkisNotNull(value) {
    if (value == "undefined" || value == null || value.length == 0) {
        return false;
    }
    value = value.replace(/(^\s*)|(\s*$)/g, '');
    if (value == "undefined" || value == null || value.length == 0) {
        return false;
    }
    return true;
}

/**
 * 判断是否为空
 * @param value
 * @returns {Boolean}
 */
function checkNotNull(value) {
    if (value == "undefined" || value == null || value.length == 0) {
        return false;
    }
    return true;
}

/**
 * 验证邮箱地址是否正确
 * @param value
 * @returns {Boolean}
 */
function checkEmail(value) {
    var exp = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    if (exp.test(value)) {
        return true;
    }
    return false;
}

/**
 * 验证手机号码是否正确
 * @param value
 * @returns {Boolean}
 */
function checkMobile(value) {
    var exp = /^(0|86|17951)?(10[0-9]|11[0-9]|12[0-9]|13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])[0-9]{8}$/;
    var exp1 = /^(((13[0-9])|(14[5,7,9])|(15[^4,\\D])|(17[0,1,3,5-8])|(18[0-9])))[\\*]{4}([0-9]{4})/;
    if (exp.test(value) || exp1.test(value)) {
        return true;
    }
    return false;
}

/**
 * 校验身份证号
 * @param value
 * @returns {Boolean}
 */
function checkIdCardNum(value) {
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    var reg1 = /(^(([0-9]{6})[\\*]{6}([0-9]{3}))$)|(^(([0-9]{6})[\\*]{8}([0-9]{3}(\d|X|x)))$)/;
    if (reg.test(value) || reg1.test(value)) {
        return true;
    }
    return false
}

/**
 * 验证文件的格式
 * @param id 需要获取的id
 * @param exts 允许的后缀
 * @returns {Boolean}
 */
function checkFile(id, exts) {

    var fileName = $("#" + id).val();
    if (!checkisNotNull(fileName)) {
        return false;
    }

    var index = fileName.indexOf(".");
    var extName = fileName.substring(index + 1).toUpperCase();
    var checked = false;
    for (var i = 0; i < exts.length; i++) {
        if (exts[i] == extName) {
            checked = true;
        }
    }
    return checked;
}


function isNumber(value) {
    var exp = /^[-+]?(([0-9]+)([.]([0-9]+))?|([.]([0-9]+))?)$/;
    return exp.test(value);
}


/**
 * 验证数据合法性
 * @param callback
 * @returns {Boolean}
 */
function validFormatOnSubmit(callback) {

    var result = true;
    $("[limitType='num']").each(function () {
        var value = $(this).val();
        if (!/^\d+$/.test(value)) {
            callback($(this));
            result = false;
        }
    });
    $("[limitType='numInEmpty']").each(function () {

        var value = $(this).val();
        if (checkisNotNull(value) && !/^\d+$/.test(value)) {
            callback($(this));
            result = false;
        }
    });
    $("[limitType='ipv4']").each(function () {
        var ip = $(this).val();
        var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        var flag = ip.match(exp);
        if (flag != undefined && flag != "") {
        } else {
            callback($(this));
            result = false;
        }
    });
    $("[limitType='ipv6']").each(function () {
        var ip = $(this).val();
        if (checIpv6(ip)) {
        } else {
            callback($(this));
            result = false;
        }
    });
    return result;
}

/**
 * 验证数据字长
 * @param callback
 * @returns {Boolean}
 */
function validLengthOnSubmit(callback) {
    var result = true;
    $("[maxLength]").each(function () {
//		var dataLength = $(this).val().replace(/[^\x00-\xff]/g,"**").length;
        var dataLength = $(this).val().length;
        if ($(this).attr("maxLength") < dataLength) {
            callback($(this));
            result = false;
        }
    });
    return result;
}

/**
 * 验证数据是否输入
 * @param callback
 * @returns {Boolean}
 */
function validRequiredOnSubmit(callback) {
    var result = true;
    $("[required='true']").each(function () {

        if ($.trim($(this).val()) == "") {

            callback($(this));
            result = false;
        }
    });
    $("[disabledRequired='true']").each(function () {
        if ($(this).attr("disabled") != "disabled" && $.trim($(this).val()) == "") {
            callback($(this));
            result = false;
        }
    });
    return result;
}

/**
 * 验证数据是否为特殊字符
 * @param callback
 * @returns {Boolean}
 */
function validSpecialCharOnSubmit() {
    var result = true;
    if ($("span[name='checkCharError']").css('display', 'inline').length > 0) {
        result = false;
    }
    return result;
}

/**
 * 通用验证
 * @returns {Boolean}
 */
function validFormOnSubmitPrefab() {
    $("span[name='checkCharError']").remove();
    $("input[type=text]:not(:disabled):not(.Wdate):not(.unfilter)").each(function () {
        checkChar(this);
    });
    return validRequiredOnSubmit(function (errorInput) {
            errorInput.siblings("[role='requiredError']").first().show()
        })
        &&
        validLengthOnSubmit(function (errorInput) {
            errorInput.siblings("[role='lengthError']").first().show()
        })
        &&
        validFormatOnSubmit(function (errorInput) {
            errorInput.siblings("[role='formatError']").first().show()
        })
        &&
        validSpecialCharOnSubmit();
}

/**
 * 验证是否为IPv6地址
 * @param callback
 * @returns {Boolean}
 */
//function checIpv6(value) {
//    var result = false;
//    var regHex = "(//p{XDigit}{1,4})";
//    var regIPv6Full = "^(" + regHex + ":){7}" + regHex + "$";
//    var regIPv6AbWithColon = "^(" + regHex + "(:|::)){0,6}" + regHex + "$";
//    var regIPv6AbStartWithDoubleColon = "^(" + "::(" + regHex + ":){0,5}" + regHex + ")$";
//    var regIPv6 = "^(" + regIPv6Full + ")|(" + regIPv6AbStartWithDoubleColon + ")|(" + regIPv6AbWithColon + ")$";
//    if (value.indexOf(":") != -1) {
//        if (value.length <= 39) {
//            var addressTemp = value;
//            var doubleColon = 0;
//            while (addressTemp.indexOf("::") != -1) {
//                addressTemp = addressTemp.substring(addressTemp.indexOf("::") + 2, addressTemp.length);
//                doubleColon++;
//            }
//            if (doubleColon <= 1) {
//                var re = new RegExp(regIPv6);
//                result = re.test(addressTemp);
//            }
//        }
//    }
//    return result;
//}

function checkChar(obj) {
    var patrn = /[`~!@#$%^&*()_+<>?:"{},·\/;'[\]]/im;
    if ($(obj).val()) {
        if (patrn.test($(obj).val())) {
            $(obj).after("<span class=\"errMsg\" name=\"checkCharError\" role=\"requiredError\">输入包含违法字符</span>");
            $("span[name='checkCharError']").show();
        }
    }
}

/**
 * 判断是否是url
 * @param str_url
 * @returns {boolean}
 * @constructor
 */
function IsURL(str_url) {
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    if (re.test(str_url)) {
        return (true);
    } else {
        return (false);
    }
}

/**
 * 判断是否是域名
 * @param str_url
 * @returns {boolean}
 * @constructor
 */
function IsDomainAddr(str_url) {
    var strRegex = "(^(http|https)?://www\.)([a-zA-Z0-9-]+\.){1,}(com|net|edu|miz|biz|cn|cc)$";
    var re = new RegExp(strRegex);
    if (re.test(str_url)) {
        return (true);
    } else {
        return (false);
    }
}

/**
 * 判断是否是域名
 * @param str_url
 * @returns {boolean}
 * @constructor
 */
function IsAddrRelax(str_url) {
    var strRegex = "^(((http)://)?(([0-9]{1,3}\.){3}[0-9]{1,3}))"// IP形式的URL- 199.194.52.184
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
    var re = new RegExp(strRegex);
    var strRegex2 = "(^((http)://)?www\.)([a-zA-Z0-9-]+\.){1,}(com|net|edu|miz|biz|cn|cc)$";
    var re2 = new RegExp(strRegex2);
    if (re.test(str_url) || re2.test(str_url)) {
        return (true);
    } else {
        return (false);
    }
}


/*
 用途：检查输入字符串是否符合正整数格式
 输入：
 s：字符串
 返回：
 如果通过验证返回true,否则返回false
 positive integer
 */
function isPositiveInteger(s) {
    var regu = "^[0-9]+$";
    var re = new RegExp(regu);
    if (s.search(re) != -1) {
        return true;
    } else {
        return false;
    }
}

/*
 用途：检查输入对象的值是否符合端口号格式
 输入：str 输入的字符串
 返回：如果通过验证返回true,否则返回false

 */
function isPort(str) {
    return (isPositiveInteger(str) && str < 65536);
}


/**
 * 判断两个时间的大小
 * d1比d2大返回false
 * d1比d2小返回true
 */
function compareDate(d1, d2) {
    return ((new Date(d1.replace(/-/g, "\/"))) < (new Date(d2.replace(/-/g, "\/"))));
}

/**
 * 返回当前时间 yyyyMMdd hhmmss
 * @returns {string}
 * @constructor
 */
function CurentTime() {
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var clock = year + "-";
    if (month < 10)
        clock += "0";
    clock += month + "-";

    if (day < 10)
        clock += "0";

    clock += day + " ";

    if (hh < 10)
        clock += "0";

    clock += hh + ":";
    if (mm < 10) clock += '0';
    clock += mm;
    return (clock);
}

function transcateDate(time) {
    var year = time.getFullYear();       //年
    var month = time.getMonth() + 1;     //月
    var day = time.getDate();            //日
    var hh = time.getHours();            //时
    var mm = time.getMinutes();          //分
    var clock = year + "-";
    if (month < 10)
        clock += "0";
    clock += month + "-";

    if (day < 10)
        clock += "0";

    clock += day + " ";

    if (hh < 10)
        clock += "0";

    clock += hh + ":";
    if (mm < 10) clock += '0';
    clock += mm;
    return (clock);
}

/**
 * 获取url里面的参数，name为参数名称
 * @param name
 * @returns {null}
 */
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]);
    return null; //返回参数值
}

/**
 * 比较两个ip段的大小 0-- 一样大； 1--ip1大； 2--ip2大
 * @param ip1
 * @param ip2
 */
function compareIpv4Addr(ip1, ip2) {
    var ipList1 = ip1.split(".");
    var ipList2 = ip2.split(".");
    var value1 = parseInt(ipList1[0] * 256 * 256 * 256) + parseInt(ipList1[1] * 256 * 256) + parseInt(ipList1[2] * 256) + parseInt(ipList1[3]);
    var value2 = parseInt(ipList2[0] * 256 * 256 * 256) + parseInt(ipList2[1] * 256 * 256) + parseInt(ipList2[2] * 256) + parseInt(ipList2[3]);
    var returndesc = "";
    if (value1 > value2) {
        returndesc = "1";
    } else if (value1 < value2) {
        returndesc = "2";
    } else {
        returndesc = "0";
    }
    return returndesc;
}

/**
 * 将秒数转化为时、分、秒 显示到jsp页面上去
 * @param time
 * @returns {*}
 */
function timeFormate(time) {

    var hour = parseInt(time / 3600);
    var day = parseInt(hour / 24);
    hour = hour % 24;
    var tempTime = time % 3600;
    var min = parseInt(tempTime / 60);
    var sec = tempTime % 60;
    var returnValue = "";
    if (day > 0)
        returnValue = day + "天";
    if (hour > 0)
        returnValue += hour + "时";
    if (min > 0)
        returnValue += min + "分";
    if (sec > 0)
        returnValue += sec + "秒";

    if (returnValue == "")
        return "0" + "秒";

    document.write(returnValue);
}


/**
 * 将秒数转化为时、分、秒
 * @param time
 * @returns {*}
 */
function timeFormate2(time) {
    var hour = parseInt(time / 3600);

    var day = parseInt(hour / 24);
    hour = hour % 24;
    var tempTime = time % 3600;
    var min = parseInt(tempTime / 60);
    var sec = tempTime % 60;
    var returnValue = "";
    if (day > 0)
        returnValue = day + "天";
    if (hour > 0)
        returnValue += hour + "时";
    if (min > 0)
        returnValue += min + "分";
    if (sec > 0)
        returnValue += sec + "秒";

    if (returnValue == "")
        return "0" + "秒";
    return returnValue;
}


/**
 * 四舍五入，保留2位
 * @param value
 * @param roundDigit
 * @returns {number}
 */
function roundFun(value) {
    if (value == null) return 0;
    if (value.length > 0) {
        var value = Math.round(parseFloat(value) * 100) / 100;
        var xsd = value.toString().split(".");
        if (xsd.length == 1) {
            value = value.toString() + ".00";
            return value;
        }
        if (xsd.length > 1) {
            if (xsd[1].length < 2) {
                value = value.toString() + "0";
            }
            return value;
        }
    } else {
        return 0;
    }

}

//验证子网掩码有效性
//function checkMask(mask) {
//	obj=mask;
//	var exp=/^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
//	var reg = obj.match(exp);
//	if(reg==null) {
//		return false; //"非法"
//	} else {
//			return true; //"合法"
//		}
//}

