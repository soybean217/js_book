wx.ready(function() {

	wxSdkSuccess();
	// 5 图片接口
	// 5.1 拍照、本地选图
	var images = {
		localId: [],
		serverId: [],
	};

	getReadInfoWithId(getUrlParam('id'));

	$('.weui-panel__ft').on('click', function(event) {
		if (pics[$(this).attr('id')]) {
			var result = [];
			pics[$(this).attr('id')].split(',').forEach(function(row) {
				result.push(picDomain + row)
			})
			console.log(result)
			if (result.length > 0) {
				wx.previewImage({
					current: result[0],
					urls: result
				});
			}
		}
	})

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

	// {
	//   // title: 'title', // 分享标题
	//   desc: '读书接龙', // 分享描述
	//   // link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
	//   imgUrl: imgUrl, // 分享图标
	//   success: function() {
	//     // 用户确认分享后执行的回调函数
	//   },
	//   cancel: function() {
	//     // 用户取消分享后执行的回调函数
	//   }
	// }

});

var openDominoState = new Vue({
	el: '#openDominoState',
	data: {
		bookAddressInfo: '',
		readOwnerInfo: '',
		seen: false,
		applyButtonSeen: false,
		applyButtonText: '申请接龙读这本实体书',
	},
})
var dominoApplyInfo = new Vue({
	el: '#dominoApplyInfo',
	data: {
		innerIngHtml: '',
		seen: false,
		domino_ing: false,
	},
})

function applyDomino() {
	location = 'applyDomino.htm?readid=' + getUrlParam('id')
}

function showBookAddress(res) {
	openDominoState.bookAddressInfo = '实体书所在地：' +
		res.provinceName + ' ' + res.cityName + ' ' + res.countryName
	openDominoState.seen = true
}

function getReadInfoWithId(id) {
	$.ajax({
		url: "../ajax/getReadInfoWithIdAjax?readId=" + id,
		type: "get",
		contentType: "application/json",
		success: function(result) {
			readInfo = JSON.parse(result);
			if (!(readInfo[0].dominoOpenId && readInfo[0].dominoOpenId.length > 4)) {
				openDominoState.applyButtonSeen = true
			}
			if (readInfo.length > 0) {
				if (readInfo[0].openDomino) {
					openDominoState.readOwnerInfo = readInfo[0].nickName + ' 看完将分享这本实体书'
					showBookAddress(readInfo[0].bookAddress)
					getDominoApplysWithReadId(id)
				}
			}
		},
		error: function(xhr, status) {
			alert(JSON.stringify(status));
		},
	});
}

function getDominoApplysWithReadId(readId) {
	$.ajax({
		url: "../ajax/getDominoApplyListWithReadIdAjax?readId=" + readId,
		type: "get",
		contentType: "application/json",
		success: function(result) {
			rev = JSON.parse(result);
			console.log(rev)
			if (rev.applyList && rev.applyList.length > 0) {
				if (rev.readInfo.dominoOpenId && rev.readInfo.dominoOpenId.length > 4) {
					dominoApplyInfo.dominoChosenImg = rev.applyList[0].headImgUrl.substr(0, rev.applyList[0].headImgUrl.length - 2) + '/' + CONFIG.HEAD_ICON_REAL_RESOLUTION
					dominoApplyInfo.dominoChosenName = rev.applyList[0].nickName
				} else {
					var tmp = ''
					for (i in rev.applyList) {
						var rowImgUrl = rev.applyList[i].headImgUrl.substr(0, rev.applyList[i].headImgUrl.length - 2) + '/' + CONFIG.HEAD_ICON_REAL_RESOLUTION
						tmp += '<img height="50px" width="50px" src="' + rowImgUrl + '">'
						if (rev.applyList[i].openId == rev.baseInfo.openid) {
							openDominoState.applyButtonText = '您已申请本书'
						}
						if (rev.applyList[i].dominoStatus == 'chosen') {
							openDominoState.applyButtonSeen = false
						}
					}
					dominoApplyInfo.innerIngHtml = tmp
					dominoApplyInfo.domino_ing = true
				}
				dominoApplyInfo.dominoApplyCount = rev.applyList.length
				dominoApplyInfo.seen = true
			}
		},
		error: function(xhr, status) {
			alert(JSON.stringify(status));
		},
	});
}