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

  document.querySelector('#btnConfirm').onclick = function() {
    var bookInfo = {
      bookName: $('#inputBookName').val(),
      author: $('#inputAuthor').val(),
      translator: $('#inputTranslator').val(),
      id: getUrlParam('id'),
    };
    console.log(bookInfo);
    $.ajax({
      url: "../ajax/editBookAjax",
      type: "post",
      contentType: "application/json",
      data: JSON.stringify(bookInfo),
      dateType: "json",
      success: function(result) {
        var rev = JSON.parse(result);
        if (rev.status == 'ok') {
          location = 'listRead.htm'
        }
      },
    });
  };

  registerPreviewImage()

});

wx.error(function(res) {
  alert(res.errMsg);
});