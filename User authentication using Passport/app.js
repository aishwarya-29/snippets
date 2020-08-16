var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('mongoose');
var User = require('./models/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
passport.serializeUser(function(user,done){
  done(null,user.id);
});
passport.deserializeUser(function(id,done){
  User.findById(id, function(err,user){
      done(err,user);
  })
})
passport.use(new LocalStrategy(
  function(username, password, done) {
      User.findOne({username:username}, function(err, user){
          if(err) throw err;
          if(!user) {
              done(null,false, {message: 'Unknown user'});
          }
          User.comparePassword(password,user.password,function(err, isMatch){
              if(err) 
                  done(err);
              if(isMatch) 
                  done(null,user);
              else 
                  done(null, false, {message: 'Invalid password'});
          });
      });
  }
));
var mongoURI = "YOUR-MONGO-URI";
mongoose.connect(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log(err);
});
var conn = mongoose.connection;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
