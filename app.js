var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:/auth', { useNewUrlParser: true, useUnifiedTopology: true });
var db =mongoose.connection;
 

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// express session
app.use(session({
  secret: ('./node_modules/secret/secret.md'),
  saveUninitialized: true,
  resave: true,
  cookie: {maxAge: 180000} // 3mins
}));


// passport
app.use(passport.initialize());
app.use(passport.session());


// express validator
app.use(require('express-validator')({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.');
    var root = namespace.shift();
    var formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg : msg,
      value: value
    };
  }
}));

// connect-flash for flash messages
app.use(require('connect-flash')());
// giving a global var so that when we get a message its saved in messages which can be access 
app.use(function (req, res, next) {
  res.locals.messages = require('express-message')(req, res);
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
app.listen(1500, function(){
  console.log("server running on port 1500");
});