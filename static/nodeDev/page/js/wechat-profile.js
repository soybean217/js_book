/*
 * 注意：
 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
 * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
 * 3. 完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * 如有问题请通过以下渠道反馈：
 * 邮箱地址：weixin-open@qq.com
 * 邮件主题：【微信JS-SDK反馈】具体问题
 * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
 */
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
          // alert(JSON.stringify(res));
          //{"errMsg":"chooseWXPay:ok"}
          if (res.errMsg == "chooseWXPay:ok") {
            location.reload(true)
          }
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
    link: 'http://demo.open.weixin.qq.com/jssdk/',
    imgUrl: 'http://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
  };
  wx.onMenuShareAppMessage(shareData);
  wx.onMenuShareTimeline(shareData);

});

wx.error(function(res) {
  alert(res.errMsg);
});