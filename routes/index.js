var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var User = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function(req, res, next) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  console.log(`${first_name} ${password}`);

  // form validation
  check('first_name', 'min character 4 and max character 30')
  .not()
  .isEmpty()
  .isLength({
    min: 4,
    max: 30
  }).matches(/[^a-zA-Z]/g);

  check('last_name', 'min character 4 and max character 30')
  .not()
  .isEmpty()
  .isLength({
    min: 4,
    max: 30
  }).matches(/[^a-zA-Z]/g);

  check('email', 'min character 6 and max character 35')
    .not()
    .isEmpty()
    .isLength({
      min: 6,
      max: 35
    });

  check('email', 'Email not valid').isEmail().normalizeEmail().custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      // dns check email
      dns_validate_email.validEmail(value, (valid) => {
        console.log(`valid: ${vali}`);
        if (valid) {
          resolve(value);
        } else {
          reject(new Error('not a valid email'));
        }
      });
    });
  });

  check('username', 'min character 3 and max character 14')
    .not()
    .isEmpty()
    .isLength({
      min:3,
      max:14
    });

  check('username', 'Only a-z, A-Z allowed')
    .matches(/[^a-zA-Z]/g);
    check('password', 'Password should be atleast 10 character')
    .not().
    isEmpty()
    .isLength({
      min:10,
      max: 35
    });
    
  check('password')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])$/, "i")
    .withMessage('Password must include one lowercase, one uppercase, a number, and a special character');

  // to check if password match with password2
  check('password2', 'Password do not match, please check')
    .equals(req.body.password);
  // end of validation


    // check for errors during the validation
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.render('signup').json({
      errors: errors.array(),
      // to return all input value back to the user if there was error during filling
      first_name: first_name,
      last_name: last_name,
      email: email,
      username: username,
    }); // end of error check, if no errors then create new user
  } 
  else {
    // to create newUser
    var newUser = new User({
      first_name: first_name,
      last_name: last_name,
      email: email,
      username: username,
      password: password,
    });

    User.saveUser(newUser, function(err, user){
            console.log('New User Created');
            console.log(newUser);
          });

    req.flash('success', 'User added.');
    res.redirect('/');
  } // end of else for validation
}); 


router.get('/signin', function(req, res, next) {
  res.render('signin');
});

router.post('/signin', passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: 'Wrong Username or Password'
}), function(req, res, next){
      var username = req.body.username;
      console.log(username);
      req.flash('success', `Welcome`);
    });

// localStrategy
passport.use(new LocalStrategy( 
  function(username, password, done){
    User.getUserByUsername(username, function(err, user){ 
      if(err) {return done(err);}
      if(!user){
        console.log('Unknow User');
        console.log(username);
        return done(null, false,{message: 'Unknown User'});
      }
      
      User.comparePassword(password, user.password, function(err, isMatch){
        console.log(user.username);
        if(isMatch){
          return done(null, user);
        } else {
          console.log('Invalid Password');
          return done(null, false, {message:'Invalid Password'});
        }
      });

    });
  }
));

passport.serializeUser(function(User, done){
  done(null, User._id);
});

passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  req.session.destroy(function(err, callback){
    res.redirect('/');
  });

});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

module.exports = router;