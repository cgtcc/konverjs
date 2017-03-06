var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var flash = require("connect-flash");
var mongoose = require('mongoose');
var passport = require("passport");
var path = require('path');
var session = require("express-session");
var favicon = require('serve-favicon');
var logger = require('morgan');
var esc = require("esc");

//Puts all of the routes in another file
var routes = require('./routes/users');
//var configurations = require('./configuration');
var setUpPassport = require("./setuppassport");



var helmet = require('helmet');

var app = express();

app.use(helmet());


//Connect to MongoDB server in the dev1234 database
mongoose.connect("mongodb://localhost:27017/dev1234");
setUpPassport();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
//Setting body-parser’s extended option to false makes the parsing simpler and more secure
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session ( {
    secret: "*******_____CHANGE_ME_WITH_YOUR_OWN_PASSPHRASE_______********",
    resave: true,
    saveUninitialized: true
}));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('index');
});

module.exports = app;
