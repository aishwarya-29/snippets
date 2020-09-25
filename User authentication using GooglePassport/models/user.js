var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
    email: String,
    password: String,
    username: String,
    googleID: String
});

var User = module.exports = mongoose.model("User", userSchema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(5,function(err,salt){
        if(err)
            console.log(err);
        else {
            bcrypt.hash(newUser.password, salt, function(err, hash){
                newUser.password = hash;
                newUser.save(callback);
            });
        }
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        console.log("is match");
        callback(err,isMatch);
    });
}

module.exports.getUserbyUsername = function(username,callback) {
    var query = {username: username};
    User.findOne(query, callback);
}