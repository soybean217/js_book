var gInfo = {}
wx.ready(function() {

  wxSdkSuccess();
  // 5 图片接口
  // 5.1 拍照、本地选图
  var images = {
    localId: [],
    serverId: [],
  };

  getDominoApplysWithReadId(getUrlParam('readid'));

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

function confirmDomino(index) {
  if (gInfo.baseInfo.openid == gInfo.readInfo.openId) {
    if (listApply.items[index].dominoStatusShow == '选择') {
      $.confirm({
        title: '',
        text: '确认把书给"' + listApply.items[index].nickName + '"?选了就不能取消哦!',
        onOK: function() {
          console.log('confirmDomino')
          chooseDominoApplysWithOpenId(listApply.items[index].openId, getUrlParam('readid'))
        },
      });
    }
  }
}

function showChosenApplyAddress(openId, readId) {
  $.ajax({
    url: "../ajax/getChosenApplyAddressAjax?openId=" + openId + '&readId=' + readId,
    type: "get",
    contentType: "application/json",
    success: function(result) {
      rev = JSON.parse(result);
      addressContent = '姓名:' + rev.userName + '\n' + '邮编:' + rev.postalCode + '\n' + rev.provinceName + ' ' + rev.cityName + ' ' + rev.countryName + ' ' + rev.detailInfo + '\n电话:' + rev.telNumber
      listApply.chosenTarget = true
      listApply.targetAddress = addressContent
        // $('#taTargetAddress').val(addressContent)
    },
    error: function(xhr, status) {
      alert(JSON.stringify(status));
    },
  });
}

function chooseDominoApplysWithOpenId(openId, readId) {
  $.ajax({
    url: "../ajax/chooseDominoApplysWithOpenIdAjax?openId=" + openId + '&readId=' + readId,
    type: "get",
    contentType: "application/json",
    success: function(result) {
      rev = JSON.parse(result);
      console.log(rev)
      if (rev.status == 'ok') {
        window.location.href = updateUrl(window.location.href);
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

function getDominoApplysWithReadId(readId) {
  $.ajax({
    url: "../ajax/getDominoApplyListWithReadIdAjax?readId=" + readId,
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
      var rowImgUrl = rev.applyList[i].headImgUrl.substr(0, rev.applyList[i].headImgUrl.length - 2) + '/96'
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