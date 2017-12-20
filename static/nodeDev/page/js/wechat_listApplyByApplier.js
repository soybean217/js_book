var gInfo = {}
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
    // link: 'http://demo.open.weixin.qq.com/jssdk/',
    // imgUrl: 'http://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
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
      confirmDomino(event)
    }
  }
})

new Clipboard('#copyAddress');


function getApplyList() {
  $.ajax({
    url: "../ajax/getApplyListAjax",
    type: "get",
    contentType: "application/json",
    success: function(result) {
      rev = JSON.parse(result);
      console.log('rev', rev)
      gInfo = rev
      if (rev.readInfo) {
        book.bookInfo = htmlBookInfo(rev.readInfo)
      }
      procApplyListData(rev)
      if (rev.applyList[0].dominoStatus == "chosen" && rev.baseInfo.openid == rev.readInfo.openId) {
        showChosenApplyAddress(rev.applyList[0].openId, getUrlParam('readid'))
      }
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
      var rowImgUrl = rev.applyList[i].headImgUrl.substr(0, rev.applyList[i].headImgUrl.length - 2) + '/46'
      tmpItem.img = rowImgUrl
      tmpItem.nickName = rev.applyList[i].nickName
      tmpItem.openId = rev.applyList[i].openId
      if (rev.applyList[i].dominoMethod == 'byHand') {
        tmpItem.method = '自取'
      } else if (rev.applyList[i].dominoMethod == 'express') {
        tmpItem.method = '快递'
        tmpItem.aboutCity = '寄往' + rev.applyList[i].expressAddress.provinceName + rev.applyList[i].expressAddress.cityName
        if (rev.applyList[i].expressFeePayStatus && rev.applyList[i].expressFeePayStatus == 'payed') {
          tmpItem.aboutCity += '［已支付运费' + rev.applyList[i].expressFee + '元］'
        } else {
          tmpItem.aboutCity += '［未支付运费］'
        }
      }
      if (rev.applyList[i].dominoStatus == 'chosen') {
        if (rev.baseInfo.openid == rev.readInfo.openId) {
          tmpItem.dominoStatusShow = '已选中'
        } else {
          tmpItem.dominoStatusShow = '已选中'
        }
        tmpItem.ftHtml = '<button class="weui-btn weui-btn_warn">' + tmpItem.dominoStatusShow + '</button>'
      } else if (rev.applyList[i].dominoStatus == 'reject') {
        tmpItem.dominoStatusShow = '未选中'
        tmpItem.ftHtml = '<button class="weui-btn weui-weui-btn_disabled weui-btn_default">' + tmpItem.dominoStatusShow + '</button>'
      } else if (rev.baseInfo.openid == rev.readInfo.openId) {
        tmpItem.dominoStatusShow = '选择'
        tmpItem.ftHtml = '<button class="weui-btn weui-btn_primary">' + tmpItem.dominoStatusShow + '</button>'
      }
      listApply.items.push(tmpItem)
    }
  }
}