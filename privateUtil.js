module.exports.raw = function(args, isFilterCode) {
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = '';
	for (var k in newArgs) {
		if (!(isFilterCode && (k == 'code' || k == 'state'))) {
			string += '&' + k + '=' + newArgs[k];
		}
	}
	if (string.length > 0) {
		string = string.substr(1);
	}
	return string;
};

module.exports.cleanedUrl = function(req) {
	cleanedQueryString = this.raw(req.query, true)
	if (cleanedQueryString.length > 0) {
		// return req.protocol + '://' + req.hostname + req.url.split('?')[0] + '?' + cleanedQueryString
		return 'https://' + req.hostname + req.url.split('?')[0] + '?' + cleanedQueryString
	} else {
		// return req.protocol + '://' + req.hostname + req.url.split('?')[0]
		return 'https://' + req.hostname + req.url.split('?')[0]
	}
};

Array.prototype.each = function(trans) {
	for (var i = 0; i < this.length; i++)
		this[i] = trans(this[i], i, this);
	return this;
};
Array.prototype.map = function(trans) {
	return [].concat(this).each(trans);
};
RegExp.escape = function(str) {
	return new String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

function properties(obj) {
	var props = [];
	for (var p in obj) props.push(p);
	return props;
}
// ---------------------------------------------

module.exports.renderHtml = function(str, replacements) {
	// copy from net . 好希望能有一个一次遍历就把字典全部替换掉的
	// http://bbs.csdn.net/topics/320097246
	var regex = new RegExp(properties(replacements).map(RegExp.escape).join("|"), "g");
	var str = str.replace(regex, function($0) {
		return replacements[$0];
	});
	return str
};