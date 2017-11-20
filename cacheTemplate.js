'use strict';
var fs = require("fs");
var CONFIG = require('./config.js');
var globalInfo = require('./globalInfo.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel(CONFIG.LOG_LEVEL);

var cacheTemplate = function() {

  freshFiles();
  setInterval(freshFiles, CONFIG.TEMPLATE_REFRESH_INTERVAL);
  //eval in interval or timeout is not working good . 

  // function freshFiles() {
  //   for (var i in globalInfo.cacheTemplate) {
  //     if (globalInfo.cacheTemplate.hasOwnProperty(i)) { //filter,只输出man的私有属性
  //       console.log(i, ":", globalInfo.cacheTemplate[i]);
  //       var tmpPath = CONFIG.TEMPLATE_DIR + i + '.htm';
  //       logger.debug(tmpPath)
  //       var stats = fs.statSync(tmpPath);
  //       logger.debug(stats.mtime == globalInfo.cacheTemplate[i].mtime);
  //     };
  //   }
  // };



  function freshFiles() {
    fs.readdir(CONFIG.TEMPLATE_DIR, function(err, files) {
      if (err) {
        logger.error('read dir error');
      } else {
        files.forEach(function(item) {
          var tmpPath = CONFIG.TEMPLATE_DIR + item;
          var stats = fs.statSync(tmpPath);
          if (!stats.isDirectory()) {
            // var filenamePrefix = item.split('.')[0]
            var filenamePrefix = item
            if (!globalInfo.cacheTemplate[filenamePrefix]) {
              globalInfo.cacheTemplate[filenamePrefix] = {}
            }
            if (!globalInfo.cacheTemplate[filenamePrefix].mtime) {
              globalInfo.cacheTemplate[filenamePrefix].mtime = stats.mtime;
              globalInfo.cacheTemplate[filenamePrefix].content = fs.readFileSync(tmpPath, "utf-8");
              logger.debug(tmpPath + ' initail')
            } else if (globalInfo.cacheTemplate[filenamePrefix].mtime < stats.mtime) {
              globalInfo.cacheTemplate[filenamePrefix].mtime = stats.mtime;
              globalInfo.cacheTemplate[filenamePrefix].content = fs.readFileSync(tmpPath, "utf-8");
              logger.debug(tmpPath + ' refresh')
            }
          }
        });
      }
    });
  };


}

module.exports = cacheTemplate;