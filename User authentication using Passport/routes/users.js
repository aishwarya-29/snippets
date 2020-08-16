var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require('../models/users');

/* GET users listing. */
router.get("/login", function(req,res){
  console.log(req.user);
  res.render("user/login.ejs");
});

router.post("/login", passport.authenticate('local',{successRedirect: '/',
failureRedirect: '/user/login'}), function (req, res) {});

router.get("/signup", function(req,res){
  res.render("user/signup.ejs");
});

router.post("/signup", function (req, res) {
  console.log(req.body);
  var password = req.body.password;
  var password2 = req.body.password2;
  if(password == password2) {
      var newUser = new User ({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          password: req.body.username
      });

      User.createUser(newUser, function(err, user){
          if(err)
              throw err;
          console.log(user);
          res.send(user).end();   
      });
  } else {
      res.status(500).send("{errors: \"Passwords don't match\"}").end()
  }
});

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
