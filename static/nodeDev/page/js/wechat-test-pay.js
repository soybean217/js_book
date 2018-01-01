wx.ready(function() {

  wxSdkSuccess();
  // 1 判断当前版本是否支持指定 JS 接口，支持批量判断

  // 10 微信支付接口
  // 10.1 发起一个支付请求
  document.querySelector('#chooseWXPay').onclick = function() {
    $.ajax({
      type: 'GET',
      url: "../ajax/createUnifiedOrderAjax",
      dataType: 'json',
      success: function(data) {
        // alert(JSON.stringify(data))
        console.log(data)

        // var rev = JSON.parse(result);

        // wx.chooseWXPay({
        //   timestamp: data.timeStamp,
        //   nonceStr: 'noncestr',
        //   package: '',
        //   signType: 'MDS', // 注意：新版支付接口使用 MD5 加密
        //   paySign: 'bd5b1933cda6e9548862944836a9b52e8c9a2b69'
        // });
        data.success = function(res) {
          alert(JSON.stringify(res))
            //{"errorMsg":"chooseWXPay:ok"}
        }
        wx.chooseWXPay(data)
      },
      error: function(xhr, type) {
        alert('Ajax error!');
      }
    });
  };


  var shareData = {
    title: '微信JS-SDK Demo',
    desc: '微信JS-SDK,帮助第三方为用户提供更优质的移动web服务',
    link: 'https://demo.open.weixin.qq.com/jssdk/',
    imgUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
  };
  wx.onMenuShareAppMessage(shareData);
  wx.onMenuShareTimeline(shareData);

});

wx.error(function(res) {
  alert(res.errMsg);
});