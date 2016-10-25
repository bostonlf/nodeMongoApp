var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var multer  = require('multer');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('.html',require('ejs').__express);//两个下划线

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({ dest: '/tmp/'}).array('image'));
//app.use 加载用于处理http請求的middleware（中间件），当一个请求来的时候，会依次被这些 middlewares处理。
//就相当于一个中间件处理器，请求来了，让那些中间件先处理一遍



/*  这段不好用 

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/wilsondb1'); //注:nodetest1为数据库名
app.get('/userlist', users.userlist(db));

end*/

//app.get('/modify.html', routes.toModify); //跳转到修改页面


/**中间件 start**/

app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();//如果当前中间件没有终结请求-响应循环，则必须调用 next() 方法将控制权交给下一个中间件，否则请求就会挂起。
});



/**这个不好用，不知道为什么**
app.use('/user/qq', function(req, res, next) {
  console.log('Request URL:', req.originalUrl);
  next();
}, function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});
**end**/

/**中间件 endb**/


app.use('/', routes);
app.use('/users', users);


/** app.locals对象是一个javascript对象，它的属性就是程序本地的变量。
一旦设定，app.locals的各属性值将贯穿程序的整个生命周期，与其相反的是res.locals，它只在这次请求的生命周期中有效。**/
app.locals.lvfeitestlocals="lvfeitestlocals"
/*add line below can show word*/
app.get('/test', function (req, res) {
	 console.log('lvfeitestlocals="lvfeitestlocals"');
   res.send(req.originalUrl+"xxxx"+app.locals.lvfeitestlocals+"@@"+__dirname);//这时的 __dirname 是当前文件app.js所在的目录
})
/**end**/


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

//app.listen(3001)

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("lvei APP http://%s:%s", host, port)

})


module.exports = app;
