'use strict';
var express = require('express');
var CONFIG = require('./config.js');
var app = express();
var mysql = require('mysql');
var xml2js = require('xml2js');
var xmlparser = require('express-xml-bodyparser');
var log4js = require('log4js');
var logger = log4js.getLogger();
// log4js.configure({ 
// 	appenders: [{  
// 		type: 'console',
// 		  layout: {   
// 			type: 'pattern',
// 			   pattern: '[%r] [%[%5.5p%]] - %m%n'  
// 		} 
// 	}]
// })
logger.setLevel(CONFIG.LOG_LEVEL);
// logger.appender.layout.pattern("[%h %x{pid}] - [%d] [%p] %c %m");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var poolConfig = mysql.createPool({
	host: CONFIG.DBPRODUCT.HOST,
	user: CONFIG.DBPRODUCT.USER,
	password: CONFIG.DBPRODUCT.PASSWORD,
	database: CONFIG.DBPRODUCT.DATABASE,
	port: CONFIG.DBPRODUCT.PORT
});
var poolLog = mysql.createPool({
	host: CONFIG.DBLOG.HOST,
	user: CONFIG.DBLOG.USER,
	password: CONFIG.DBLOG.PASSWORD,
	database: CONFIG.DBLOG.DATABASE,
	port: CONFIG.DBLOG.PORT
});

var selectSQL = "show variables like 'wait_timeout'";

poolConfig.getConnection(function(err, conn) {
	if (err) console.log("POOL ==> " + err);

	function query() {
		conn.query(selectSQL, function(err, res) {
			console.log(new Date());
			console.log(res);
			console.log(' db pool ready .');
			conn.release();
		});
	}
	query();
	// setInterval(query, 5000);
});
// tokenWechat.freshToken(poolConfig);

function notify(req, res) {
	res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
	res.end()
	logger.debug('notify-req.body', req.body)
	if (req.body.xml.out_trade_no.length == 19) {
		processOrder()
	} else if (req.body.xml.total_fee == CONFIG.MEMBER_FEE) {
		poolConfig.query("SELECT ifnull(memberExpireTime,0) as memberExpireTime FROM tbl_wechat_users where openId=?", [req.body.xml.openid], function(err, rows, fields) {
			var ctime = new Date().getTime() / 1000
			if (err) {
				logger.error(err);
			} else {
				if (rows.length > 0) {
					var memberExpireTime = 0
					if (rows[0].memberExpireTime > ctime) {
						memberExpireTime = rows[0].memberExpireTime + 86400 * 365
					} else {
						memberExpireTime = ctime + 86400 * 365
					}
					poolConfig.query("update tbl_wechat_users set memberExpireTime=?,lastChargeTime=? where openId=?  ", [memberExpireTime, ctime, req.body.xml.openid], function(err, rows, fields) {
						if (err) {
							throw err;
						} else {
							if (!rows.constructor.name == 'OkPacket') {
								logger.error('update tbl_wechat_users set memberExpireTime:')
								logger.error(rows)
							}
						}
					})
				} else {
					logger.error('can not find the user:')
					logger.error(rows)
				}
			}
		});
	}
	logNotify()

	function logNotify() {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		poolLog.query("insert log_async_generals (id,logId,para01,para02) values(?,?,?,?)", [new Date().getTime() * 1000000 + CONFIG.SERVER_ID * 10000 + 10000 * Math.random(),
			201, JSON.stringify(req.body.xml), ip
		], function(err, rows, fields) {
			if (err) {
				logger.error(err);
			} else {
				if (!(rows.constructor.name == 'OkPacket')) {
					logger.error('error actLogAjax sql:')
					logger.error(rows)
				}
			}
		});
	}

	function processOrder() {
		poolLog.query("SELECT * FROM log_sync_generals where id=?", [req.body.xml.out_trade_no], function(err, rows, fields) {
			if (err) {
				logger.error(err);
			} else {
				if (rows[0].para01 == 'expressFee') {
					processExpressFee(rows[0])
					updateOrderLog()
				}
			}
		});
	}

	function updateOrderLog() {
		poolLog.query("update log_sync_generals set para04=? where id=?", [req.body.xml.transaction_id, req.body.xml.out_trade_no], function(err, rows, fields) {
			if (err) {
				logger.error(err);
			} else {

			}
		});
	}

	function processExpressFee(orderLog) {
		poolConfig.query("update tbl_apply_dominos set expressFee=?,expressFeePayStatus='payed',transactionId=? where readid=? and openId=?", [req.body.xml.total_fee / 100, req.body.xml.transaction_id, orderLog.para02, req.body.xml.openid], function(err, rows, fields) {
			if (err) {
				logger.error(err);
			} else {

			}
		});
	}
}

function index(req, res) {
	res.send('Hello World!');
}

app.get(CONFIG.PAY_DIR_FIRST + '/', index);
app.post(CONFIG.PAY_DIR_FIRST + '/notify', xmlparser({
	trim: false,
	explicitArray: false
}), notify);

var server = app.listen(CONFIG.PAY_LISTEN_PORT, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});