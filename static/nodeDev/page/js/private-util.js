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

function updateUrl(url, key) {
	var key = (key || 't') + '='; //默认是"t"
	var reg = new RegExp(key + '\\d+'); //正则：t=1472286066028
	var timestamp = +new Date();
	if (url.indexOf(key) > -1) { //有时间戳，直接更新
		return url.replace(reg, key + timestamp);
	} else { //没有时间戳，加上时间戳
		if (url.indexOf('\?') > -1) {
			var urlArr = url.split('\?');
			if (urlArr[1]) {
				return urlArr[0] + '?' + key + timestamp + '&' + urlArr[1];
			} else {
				return urlArr[0] + '?' + key + timestamp;
			}
		} else {
			if (url.indexOf('#') > -1) {
				return url.split('#')[0] + '?' + key + timestamp + location.hash;
			} else {
				return url + '?' + key + timestamp;
			}
		}
	}
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
				// location.reload(true);
			window.location.href = updateUrl(window.location.href);
		} else {
			console.log('reRegisterWxTag again')
		}

	} else {
		alert(res.errMsg);
	}
});