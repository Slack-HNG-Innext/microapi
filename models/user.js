var mongoose = require("mongoose");
var bcryptjs = require('bcryptjs');

// User Schema (this is the definition of the input the DB will take more like stating the head of table)
var UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    index: true,
    trim: true,
    require: true,
  },
  last_name: {
    type: String,
    index: true,
    trim: true,
    require: true,
  },
  email: {
    type: String,
    trim: true,
    require: true,
  },
  username: {
    type: String,
    index: true,
    trim: true,
    require: true,
  },
  password: {
    type: String,
    bcryptjs: true,
    require: true,
    trim: true,
  },
  admin: false,
});

// this is to convert this UserSchema in a usable model called User
var User = mongoose.model("User", UserSchema);
module.exports = mongoose.model("User", UserSchema); 
// then this export the model User so it can be used outside this file.

// To fetch All Useres in the collection Useres in our DB
module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback).lean();
};

// To fatch just a User in the collection Useres in our DB
module.exports.getUserById = function (id, callback) {
  User.findById(id, callback).lean();
};

// save new user
module.exports.saveUser = function(newUser, callback) {
    bcryptjs.hash(newUser.password, 15, function(err, hash){
        if (err) throw err;
        newUser.password = hash;
        newUser.save(callback);
        console.log(newUser);
    });
};

// Compare Password
module.exports.comparePassword = function(usersPassword, hash, callback) {
  bcryptjs.compare(usersPassword, hash, function(err, isMatch){
    if (err) throw err;
    callback(null, isMatch);
  });
};