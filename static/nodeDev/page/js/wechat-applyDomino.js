$.showLoading();
var gApplyDominoInfoWithReadId
wx.ready(function() {

	wxSdkSuccess();
	// 5 图片接口
	// 5.1 拍照、本地选图
	var images = {
		localId: [],
		serverId: [],
	};

	getApplyDominoInfoWithReadId(getUrlParam('readid'));

	function shareData(act) {
		// title: '微信JS-SDK Demo',
		// desc: '读书接龙',
		// link: 'https://demo.open.weixin.qq.com/jssdk/',
		// imgUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
		return { // title: 'title', // 分享标题
			desc: '请关注公众号-读书接龙', // 分享描述
			// link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function() {
				logAction(act, 'success');
				// 用户确认分享后执行的回调函数
			},
			cancel: function() {
				logAction(act, 'cancel');
				// 用户取消分享后执行的回调函数
			}
		}
	};
	// wx.onMenuShareAppMessage(shareData);
	wx.onMenuShareTimeline(shareData('onMenuShareTimeline'));
	wx.onMenuShareAppMessage(shareData('onMenuShareAppMessage'));
	wx.onMenuShareQQ(shareData('onMenuShareQQ'));
	wx.onMenuShareWeibo(shareData('onMenuShareWeibo'));
	wx.onMenuShareQZone(shareData('onMenuShareQZone'));

});

function showPayExpressFee(bookAddress) {
	$.prompt({
		title: '修改运费',
		text: dominoInfo.bookAddressInfo,
		input: dominoInfo.expressDefaultFee,
		empty: false, // 是否允许为空
		onOK: function(input) {
			payExpressFee(input)
		},
		onCancel: function() {}
	});
}

function payExpressFee(fee) {
	$.ajax({
		type: 'GET',
		url: "../ajax/createUnifiedOrderAjax?id=" + getUrlParam('readid') + "&type=expressFee&fee=" + fee,
		dataType: 'json',
		success: function(data) {
			data.success = function(res) {
				// alert(JSON.stringify(res));
				//{"errMsg":"chooseWXPay:ok"}
				if (res.errMsg == "chooseWXPay:ok") {
					alert('支付成功');
					window.location.href = updateUrl(window.location.href);
				}
			}
			wx.chooseWXPay(data)
		},
		error: function(xhr, type) {
			alert('Ajax error!');
		}
	});
}

function cancelDomino(fee) {
	var readId = getUrlParam('readid')
	$.ajax({
		type: 'GET',
		url: "../ajax/cancelDominoAjax?readId=" + readId,
		dataType: 'json',
		success: function(rev) {
			console.log(rev)
			if (rev.status && rev.status == 'ok') {
				$.alert("取消成功", function() {
					location = 'read?id=' + readId
				});
			} else {
				$.alert(rev.status);
			}
		},
		error: function(xhr, type) {
			alert('Ajax error!');
		}
	});
}

function editReceiveAddress() {
	wx.openAddress({
		success: function(res) {
			if (res.errMsg == 'openAddress:ok') {
				syncDominoMethodWithReadId(getUrlParam('readid'), 'express', res)
			}
		},
		cancel: function() {
			// 用户取消拉出地址
			console.log('cancel')
		}
	});
}

function takeBookByHand() {
	syncDominoMethodWithReadId(getUrlParam('readid'), 'byHand', '')
}

function syncDominoMethodWithReadId(id, dominoMethod, address) {
	var info = {
		readId: id,
		dominoMethod: dominoMethod,
		address: JSON.stringify(address)
	}
	$.ajax({
		url: "../ajax/syncDominoMethodWithReadIdAjax",
		type: "post",
		contentType: "application/json",
		data: JSON.stringify(info),
		dateType: "json",
		success: function(result) {
			var rev = JSON.parse(result);
			console.log(rev)
			if (rev.status && rev.status == 'ok') {
				getApplyDominoInfoWithReadId(id)
			}
		},
		error: function(xhr, status) {
			alert(JSON.stringify(status));
		},
	});
}

var book = new Vue({
	el: '#book',
	data: {
		bookInfo: '',
	},
})
var dominoInfo = new Vue({
	el: '#dominoInfo',
	data: {
		dominoMethod: '',
		seenExpress: false,
		expressAddress: '',
		seenPayProcess: true,
		seenPayed: true,
		expressDefaultFee: 0,
		bookAddressInfo: '',
		expressFee: 0,
		dominoStatus: '接龙中',
	},
})

function procDominoingDisplay(info) {
	if (info[0].dominoMethod == 'express') {
		dominoInfo.seenExpress = true
		dominoInfo.dominoMethod = "快递"
		expressAddress = JSON.parse(info[0].expressAddress)
		bookAddress = JSON.parse(info[0].bookAddress)
		dominoInfo.expressAddress = '我的收件地址:' + '<br>姓名:' + expressAddress.userName + '<br>' + '邮编:' + expressAddress.postalCode + '<br>' + expressAddress.provinceName + ' ' + expressAddress.cityName + ' ' + expressAddress.countryName + ' ' + expressAddress.detailInfo + '<br>电话:' + expressAddress.telNumber
		if (info[0].expressFeePayStatus == 'payed') {
			dominoInfo.seenPayProcess = false
			dominoInfo.seenPayed = true
			dominoInfo.expressFee = info[0].expressFee
		} else {
			dominoInfo.seenPayProcess = true
			dominoInfo.seenPayed = false
			if (expressAddress.provinceName == bookAddress.provinceName && bookAddress.cityName == expressAddress.cityName) {
				dominoInfo.expressDefaultFee = 12
			} else {
				dominoInfo.expressDefaultFee = 22
			}
			if (info[0].expressFeePayStatus != 'refund' && info[0].dominoStatus == "waitChoose") {
				$.modal({
					title: "支付运费",
					text: "",
					buttons: [{
						text: "取消",
						className: "default",
						onClick: function() {}
					}, {
						text: "支付",
						onClick: function() {
							showPayExpressFee(bookAddress)
						},
					}, ]
				});
			}
		}
	} else if (info[0].dominoMethod == 'byHand') {
		dominoInfo.dominoMethod = "见面接龙书籍"
	}
}

function getApplyDominoInfoWithReadId(id) {
	$.ajax({
		url: "../ajax/getApplyDominoInfoWithReadIdAjax?readId=" + id,
		type: "get",
		contentType: "application/json",
		success: function(result) {
			rev = JSON.parse(result);
			console.log('getApplyDominoInfoWithReadId', rev)
			gApplyDominoInfoWithReadId = rev
			info = rev.applyList
				// $('#loadingToast').css("display", "none")
			if (rev.applyList && rev.applyList.length > 0) {
				book.bookInfo = htmlBookInfo(info[0])
				bookAddress = JSON.parse(info[0].bookAddress)
				dominoInfo.bookAddressInfo = '书籍所在地：' +
					bookAddress.provinceName + ' ' + bookAddress.cityName + ' ' + bookAddress.countryName
				if (info[0].dominoOpenId && info[0].dominoOpenId.length > 5) {
					dominoInfo.dominoStatus = '接龙完成'
					dominoInfo.seenPayProcess = false
				} else {
					procDominoingDisplay(info)
				}

			} else {
				$.modal({
					title: "选择或输入快递地址",
					text: "然后根据书所在地，自行修改和支付运费，若分享者选你，运费将转给它，没被选中会自动退款。",
					buttons: [{
						text: "确认",
						onClick: function() {
							editReceiveAddress()
						}
					}, ]
				});
			}
			$.hideLoading();
		},
		error: function(xhr, status) {
			alert(JSON.stringify(status));
		},
	});
}