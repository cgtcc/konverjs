var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var flash = require("connect-flash");
var mongoose = require('mongoose');
var passport = require("passport");
var Strategy = require('passport-http-bearer').Strategy;
var path = require('path');
var session = require("express-session");
var favicon = require('serve-favicon');
var logger = require('morgan');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var configurations = require('./configuration');
//Puts all of the routes in another file

var users = require('./routes/ui/users');
var posts = require('./routes/ui/posts');
var api = require('./routes/api/index');


//var configurations = require('./configuration');
var setUpPassport = require("./middlewares/configpassport");



var helmet = require('helmet');

var app = express();

app.use(helmet());


//Connect to MongoDB server in the dev1234 database
mongoose.connect(configurations.database); // connect to database
app.set('superSecret', configurations.secret); // secret variable

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
app.use(session({
  secret: configurations.secret,
  resave: true,
  saveUninitialized: true
}));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());



//the routers are added to the main app
app.use('/', users);
app.use('/posts', posts);
// apply the routes to our application with the prefix /api
app.use('/api', api);

/*
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
});*/

module.exports = app;
