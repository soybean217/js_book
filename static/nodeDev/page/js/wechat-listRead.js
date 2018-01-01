wx.ready(function() {

	wxSdkSuccess();

	getListRead();

	// 5 图片接口
	// 5.1 拍照、本地选图
	var images = {
		localId: [],
		serverId: []
	};
	document.querySelector('#chooseImageNewCover').onclick = function() {
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function(res) {
				$('#loadingToast').css("display", "block")
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
								$('#loadingToast').css("display", "block")
								$.ajax({
									url: "../ajax/picUploadAjax?act=beginRead",
									type: "post",
									contentType: "application/json",
									async: false,
									data: JSON.stringify(images),
									success: function(result) {
										var rev = JSON.parse(result);
										if (rev.status == 'ok' && rev.location) {
											location = rev.location
										} else {
											console.log(result)
											alert(result)
											$('#loadingToast').css("display", "none")
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
				upload();
			}
		});
	};
});

function getListRead() {
	$.ajax({
		type: 'GET',
		url: "../ajax/listReadAjax",
		dataType: 'json',
		success: function(data) {
			console.log(data)
			var result = ''
			data.reads.forEach(function(row) {
				result += '<a href="read?id=' + row.id + '"><div class="weui-cell"><div class = "weui-cell__hd" style = "position: relative;margin-right: 10px;" ><img src = "' + row.cover + '?imageView2/2/w/80"  style = "width: 50px;display: block" /></div><div class = "weui-cell__bd"><p style = "color: #000000;">' + row.bookName + '</p><p style = "font-size: 13px;color: #888888;">' + (row.author.length > 0 ? (' 作者：' + row.author + ' ') : '') + (row.translator.length > 0 ? (' 译者：' + row.translator + ' ') : '') + '</p></div></div></a>'
			})
			$('#listRead').html(result);
			$('#loadingToast').css("display", "none")
				// $('.weui-cells').append(result);
		},
		error: function(xhr, type) {
			console.log(xhr)
			console.log(type)
				// alert('Ajax error!');
		}
	});
}