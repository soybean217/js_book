var modifyTag = new Date().getTime()
wx.ready(function() {
  wxSdkSuccess();
  // 1 判断当前版本是否支持指定 JS 接口，支持批量判断
  wx.checkJsApi({
    jsApiList: [
      'getNetworkType',
      'previewImage'
    ],
    success: function(res) {}
  });

  registerPreviewImage()
  document.title = $("#spanNote").html()

  function shareData(act) {
    // title: '微信JS-SDK Demo',
    // desc: '读书接龙',
    // link: 'https://demo.open.weixin.qq.com/jssdk/',
    // imgUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
    return {
      title: $("#spanNote").html(),
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


wx.error(function(res) {
  alert(res.errMsg);
});