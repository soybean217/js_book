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
  // 5 图片接口
  // 5.1 拍照、本地选图
  var images = {
    localId: [],
    serverId: [],
  };

  getReadInfoWithId(getUrlParam('id'));

  var chooseImageNote = $("#chooseImageNote")
  if (chooseImageNote.length > 0) {
    document.querySelector('#chooseImageNote').onclick = function() {
      wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          images.localId = res.localIds;
          var i = 0,
            length = images.localId.length;
          images.serverId = [];

          function upload() {
            wx.uploadImage({
              localId: images.localId[i],
              success: function(res) {
                i++;
                //alert('已上传：' + i + '/' + length);
                images.serverId.push(res.serverId);
                if (i < length) {
                  upload();
                } else {
                  $.ajax({
                    url: "../ajax/picUploadAjax?act=note&readId=" + getUrlParam('id'),
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify(images),
                    timeout: 120000,
                    success: function(result) {
                      $('#loadingToast').css("display", "none")
                      var rev = JSON.parse(result);
                      if (rev.status == 'ok' && rev.location) {
                        location = rev.location
                      } else {
                        console.log(result)
                        alert(result)
                      }
                    },
                    error: function(xhr, status) {
                      alert(JSON.stringify(status));
                      alert(JSON.stringify(xhr));
                      alert('error,请关闭重新进入');
                      $('#loadingToast').css("display", "none")
                    },
                  });
                }
              },
              fail: function(res) {
                alert(JSON.stringify(res));
                $('#loadingToast').css("display", "none")
              }
            });
          }
          $('#loadingToast').css("display", "block")
          upload();
        }
      });
    };
  }

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
    // link: 'http://demo.open.weixin.qq.com/jssdk/',
    // imgUrl: 'http://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRt8Qia4lv7k3M9J1SKqKCImxJCt7j9rHYicKDI45jRPBxdzdyREWnk0ia0N5TMnMfth7SdxtzMvVgXg/0'
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

function goPageListApply() {
  location = 'listApplyDomino.htm?readid=' + getUrlParam('id')
}

var readInfo = null;

var vueRadioDomino = new Vue({
  el: '#vue-radio-1',
  data: {
    toggle: '',
    cTrue: 1,
    cFalse: 0,
    seen: false,
    canUpdate: false
  },
  watch: {
    toggle: function(val, oldVal) {
      if (readInfo && readInfo[0].openDomino != val) {
        this.canUpdate = true;
      }
      if (this.canUpdate) {
        if (vueRadioDomino.toggle) {
          $('#iosDialog1').css("display", "block")
        } else {
          syncRadioStatusWithReadId(getUrlParam('id'), '')
        }
      }
    }
  }
})

var addressInfo = new Vue({
  el: '#addressInfo',
  data: {
    bookAddressInfo: '',
    seen: false,
  },
})

function showBookAddress(res) {
  addressInfo.bookAddressInfo = '所在地：' +
    res.provinceName + ' ' + res.cityName + ' ' + res.countryName
  addressInfo.seen = true
}

function shareBookCancel() {
  $('#iosDialog1').css("display", "none")
  vueRadioDomino.toggle = 0
}

function editBookAddress() {
  wx.openAddress({
    success: function(res) {
      // 用户成功拉出地址 
      // alert(JSON.stringify(res));
      // $('#addressContent').html('收货人姓名:' + res.userName)
      if (res.errMsg == 'openAddress:ok') {
        syncRadioStatusWithReadId(getUrlParam('id'), res)
          // console.log(res)
          // showCustomerAddress(res);
          // editContent(JSON.stringify(res), 'orderByCustomer', 'customerExpressInfo')
      }
    },
    cancel: function() {
      // 用户取消拉出地址
      console.log('cancel')
    }
  });
}

function syncRadioStatusWithReadId(id, address) {
  var editInfo = {
    readId: id,
    dominoStatus: vueRadioDomino.toggle,
    address: JSON.stringify(address)
  }
  $.ajax({
    url: "../ajax/syncRadioStatusWithReadIdAjax",
    type: "post",
    contentType: "application/json",
    data: JSON.stringify(editInfo),
    dateType: "json",
    success: function(result) {
      if (vueRadioDomino.toggle) {
        showBookAddress(address)
      } else {
        addressInfo.seen = false
      }
      $('#iosDialog1').css("display", "none")
        // var rev = JSON.parse(result);
    },
    error: function(xhr, status) {
      alert(JSON.stringify(status));
    },
  });
}

function getReadInfoWithId(id) {
  $.ajax({
    url: "../ajax/getReadInfoWithIdAjax?readId=" + id,
    type: "get",
    contentType: "application/json",
    success: function(result) {
      readInfo = JSON.parse(result);
      if (readInfo.length > 0) {
        vueRadioDomino.toggle = readInfo[0].openDomino
        vueRadioDomino.seen = true
        if (readInfo[0].openDomino) {
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

var dominoApplyInfo = new Vue({
  el: '#dominoApplyInfo',
  data: {
    innerIngHtml: '',
    seen: false,
    domino_ing: false,
  },
})

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
          dominoApplyInfo.dominoChosenImg = rev.applyList[0].headImgUrl.substr(0, rev.applyList[0].headImgUrl.length - 2) + '/46'
          dominoApplyInfo.dominoChosenName = rev.applyList[0].nickName
        } else {
          var tmp = ''
          for (i in rev.applyList) {
            var rowImgUrl = rev.applyList[i].headImgUrl.substr(0, rev.applyList[i].headImgUrl.length - 2) + '/46'
            tmp += '<img src="' + rowImgUrl + '">'
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

// function showPicsOfNote() {
//   var oParent = $(this).parent();
//   console.log('in1')
//   console.log(oParent.attr('id'))
//   if (pics[oParent.attr('id')]) {
//     console.log('in2')
//     var result = [];
//     pics[oParent.attr('id')].split(',').forEach(function(row) {
//       result.push(picDomain + row)
//     })
//     console.log(result)
//     if (result.length > 0) {
//       wx.previewImage({
//         current: result[0],
//         urls: result
//       });
//     }
//   }
// }