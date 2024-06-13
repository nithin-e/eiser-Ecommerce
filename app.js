var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session=require("express-session")
var cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport');
var logger = require('morgan');


const mongoose = require('./config/connectMongo');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter=require("./routes/googleAuth")
const adminrouter=require("./routes/admin/adminlogin")
// const User = require('./config/passport');


var app = express();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: false } 
  cookie: { maxAge: 120000 }
}));


// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/auth",authRouter)
app.use("/",adminrouter)






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





