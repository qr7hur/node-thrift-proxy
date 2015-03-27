var express = require('express');


var request = require('request');



var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

(function(){
  var MAX_PAGE=30;
  var CACHE_SIZE=[1000000,2000000,3000000,4000000,5000000,6000000,7000000,8000000,9000000,10000000];
  var POLICY =["RAND","FIFO","LRU"];
  var URLList=["yahoo.com",
  "sina.com",
  "www.cnn.com",
  "reddit.com",
  "ufc.tv",
  "www.coursera.org",
  "www.bodybuilding.com",
  "github.com",
  "youtube.com",
  "craigslist.com"];
  
  console.log("Workload Mode: Random Select");
  var ms = 0, p = 0, c = 0, i = 0;
  var inter;
  var suite = function(p,c,i) {
    //calculate average page acceess time under diff cache sizes for policy[k]
    
    var url = URLList[Math.floor(Math.random() * URLList.length)];
    //http://localhost:3000/proxy/RAND/1000000/google.com
    request({method: 'GET', uri: 'http://localhost:3000/proxy/'+POLICY[p]+'/'+CACHE_SIZE[c]+'/'+url, jar: true}, function (error, response, body) {
      if(p == 0 && i == 0 && c == 0) console.log("Cache Eviction Mode: "+POLICY[p]);
      i++;
      if(c == CACHE_SIZE.length-1){
        c = 0;
        p++;
        console.log(p);
        console.log("Cache Eviction Mode: "+POLICY[p]);
      }
      if(i == MAX_PAGE-1){
        clearInterval(inter);
        console.log("Cache Size: "+CACHE_SIZE[c]+
        "  Policy: "+POLICY[p]+
        " Avg. Time: "+(ms/MAX_PAGE)+" ms");
        ms = 0;
        i = 0;
        c++;
        if(p < POLICY.length) inter = setInterval(function(){ms++;}, 1);
      } 
      if(p < POLICY.length && c < CACHE_SIZE.length && i < MAX_PAGE) suite(p,c,i);
    });
  };
  inter = setInterval(function(){ms++;}, 1);
  suite(p,c,i);
}());




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
