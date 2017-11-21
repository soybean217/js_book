function registerPreviewImage() {
	// $(document).on('click', '#previewImage img', function(event) {
	$('#previewImage img').on('click', function(event) {
		var imgArray = [];
		var curImageSrc = $(this).attr('src');
		var oParent = $(this).parent();
		if (curImageSrc && !oParent.attr('href')) {
			$('#previewImage img').each(function(index, el) {
				var itemSrc = $(this).attr('src');
				imgArray.push(itemSrc);
			});
			wx.previewImage({
				current: curImageSrc,
				urls: imgArray
			});
		}
	});
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if (r != null) return unescape(r[2]);
	return null; //返回参数值
}

function getCookie(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=")
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1
			c_end = document.cookie.indexOf(";", c_start)
			if (c_end == -1) c_end = document.cookie.length
			return unescape(document.cookie.substring(c_start, c_end))
		}
	}
	return ""
}

function setCookie(c_name, value, expiredays) {
	var exdate = new Date()
	exdate.setDate(exdate.getDate() + expiredays)
	document.cookie = c_name + "=" + escape(value) +
		((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}

function wxSdkSuccess() {
	setCookie('reRegisterWxTag', "0", 1)
}

function logAction(act, result) {
	var logInfo = {
		act: act,
		result: result,
		location: window.location.href,
	};
	$.ajax({
		url: "../ajax/actLogAjax",
		type: "post",
		contentType: "application/json",
		data: JSON.stringify(logInfo),
		dateType: "json",
	});
}

function showShareTip() {
	$('#iosDialog2').css("display", "block")
}

function closeShareTip() {
	$('#iosDialog2').css("display", "none")
}

wx.error(function(res) {
	console.log('wx.error')
	if (res.errMsg == 'config:invalid signature') {
		reRegisterWxTag = getCookie('reRegisterWxTag')
		if (reRegisterWxTag != "1") {
			console.log('reRegisterWxTag :' + reRegisterWxTag)
			setCookie('reRegisterWxTag', "1", 1)
			location.reload(true);
		} else {
			console.log('reRegisterWxTag again')
		}

	} else {
		alert(res.errMsg);
	}
});