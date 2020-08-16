var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var userSchema = mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String
});

var User = module.exports = mongoose.model("User", userSchema);
module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(5,function(err,salt){
        bcrypt.hash(newUser.password,salt,function(err,hash){
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
      console.log(isMatch);
      callback(err, isMatch);
    });
}
module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
}

