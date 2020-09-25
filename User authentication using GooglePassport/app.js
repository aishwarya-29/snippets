var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var GoogleStrategy = require('passport-google-oauth20');
var config = require('./config');
var User = require('./models/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: config.SECRET_KEY,
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

var LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done) {
  User.findById(id, function(err,user){
    done(err,user);
  });
});
passport.use(new LocalStrategy(
  function(username,password,done) {
    User.findOne({username:username}, function(err,user){
      if(err)
        console.log(err);
      if(!user) {
        done(null, false, {message: 'Unknown user'});
      }
      User.comparePassword(password,user.password,function(err, isMatch){
        if(err) {
            console.log("ERR1");
            done(err);
        }
        if(isMatch) {
            console.log("MATCH");
            done(null,user);
        } else {
            console.log("NOT VALID");
            done(null, false, {message: 'Invalid password'});
        }
    });
    });
  }
))

passport.use(new GoogleStrategy({
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/google/callback"
}, function(accessToken, refreshToken, profile, done) {
  User.findOne({googleID: profile.id}, function (err,user) {
    if(user) {
        done(null,user);
    } else {
        console.log("new");
        User.create({
            username: profile.emails[0].value,
            googleID: profile.id
        }, function(err, newUser){
            if(err) 
                done(err,null);
            else {
                console.log(newUser);
                done(null,newUser);
            }
        })
          
    }
})
}
))

app.use('/', indexRouter);
app.use('/users', usersRouter);

var mongoURI = config.MONGO_URI;
mongoose.connect(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
  console.log(err);
});

app.get('/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', 
  passport.authenticate('google',{successRedirect: '/',
  failureRedirect: '/user/login'}),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

module.exports = app;
