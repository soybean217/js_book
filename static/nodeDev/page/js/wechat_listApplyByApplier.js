var gInfo = {}
$.showLoading();

wx.ready(function() {

  wxSdkSuccess();
  // 5 图片接口
  // 5.1 拍照、本地选图
  var images = {
    localId: [],
    serverId: [],
  };

  getApplyList();

  function shareData(act) {
    // title: '微信JS-SDK Demo',
    // desc: '读书接龙',
    // link: 'https://demo.open.weixin.qq.com/jssdk/',
    // imgUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
    return { // title: 'title', // 分享标题
      desc: '图书分享-读书接龙', // 分享描述
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

var listApply = new Vue({
  el: '#listApply',
  data: {
    items: [],
    chosenTarget: false,
    targetAddress: '',
  },
  methods: {
    select: function(event) {
      gotoDomino(event)
    }
  }
})

function gotoDomino(index) {
  location = 'applyDomino.htm?readid=' + listApply.items[index].readId
}

function getApplyList() {
  $.ajax({
    url: "../ajax/getApplyListAjax",
    type: "get",
    contentType: "application/json",
    success: function(result) {
      rev = JSON.parse(result);
      console.log('rev', rev)
      gInfo = rev
      procApplyListData(rev)
      $.hideLoading();
    },
    error: function(xhr, status) {
      alert(JSON.stringify(status));
    },
  });
}

function procApplyListData(rev) {
  if (rev.applyList && rev.applyList.length > 0) {
    for (i in rev.applyList) {
      var tmpItem = {}
      var rowImgUrl = rev.applyList[i].headImgUrl.substr(0, rev.applyList[i].headImgUrl.lastIndexOf('/') + 1) + CONFIG.HEAD_ICON_REAL_RESOLUTION
      tmpItem.headImgUrl = rowImgUrl
      tmpItem.nickName = rev.applyList[i].nickName
      tmpItem.bookName = rev.applyList[i].bookName
      tmpItem.openId = rev.applyList[i].openId
      tmpItem.readId = rev.applyList[i].readId
      if (rev.applyList[i].dominoMethod == 'byHand') {
        tmpItem.method = '自取'
      } else if (rev.applyList[i].dominoMethod == 'express') {
        tmpItem.method = '快递'
        tmpItem.aboutCity = ''
        if (rev.applyList[i].expressFeePayStatus && rev.applyList[i].expressFeePayStatus == 'payed') {
          tmpItem.aboutCity += '［已支付运费' + rev.applyList[i].expressFee + '元］'
        } else if (rev.applyList[i].expressFeePayStatus && rev.applyList[i].expressFeePayStatus == 'refund') {
          tmpItem.aboutCity += '［已退回运费］'
        } else {
          tmpItem.aboutCity += '［未支付运费］'
        }
      }
      tmpItem.cover = CONFIG.QCLOUD_PARA.THUMBNAILS_DOMAIN + rev.applyList[i].cover + '?imageView2/2/w/80'
      if (rev.applyList[i].dominoStatus == 'chosen') {
        tmpItem.dominoStatusShow = '(确认分享给您)'
      } else if (rev.applyList[i].dominoStatus == 'reject') {
        tmpItem.dominoStatusShow = '(已分享给别人)'
      } else {
        tmpItem.dominoStatusShow = '(还未决定分享给谁)'
      }
      listApply.items.push(tmpItem)
    }
  }
}