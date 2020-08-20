const express = require('express')
const authRoutes = express.Router()
const passport = require('passport')
const uploader = require('../configs/cloudinary')
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10);
const User = require('../models/User-model')

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
        res.status(500).json({ message: 'Something went wrong authenticating user' });
        return;
    }
    if (!theUser) {
        // "failureDetails" contains the error messages
        res.status(401).json(failureDetails);
        return;
    }
    // save user in session
    req.login(theUser, (err) => {
        if (err) {
            res.status(500).json({ message: 'Session save went bad.' });
            return;
        }
        res.status(200).json(theUser);
    });
  })(req, res, next);
})

authRoutes.post('/signup', (req, res, next) => {
  const {username, password, email} = req.body
  if (!username || !password || !email) {
    res.status(400).json({ message: 'Provide all the fields' });
    return;
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
  const notValidPwd = !regex.test(password)
  if(notValidPwd){
      res.status(400).json({ message: 'Password must have at least 6 characters, an upper case letter, a lower case and a number' });
      return;
  }
  User.findOne({ username }, (err, foundUser) => {
      if(err){
          res.status(500).json({message: "Username check went bad."});
          return;
      }
      if (foundUser) {
          res.status(400).json({ message: 'Username taken. Choose another one.' });
          return;
      }
      const hashPass = bcrypt.hashSync(password, salt);
      const aNewUser = new User({
          username,
          password: hashPass,
          email
      });
      aNewUser.save(err => {
          if (err) {
              res.status(400).json({ message: 'Saving user to database went wrong.' });
              return;
          }
          // Automatically log in user after sign up
          req.login(aNewUser, (err) => {
              if (err) {
                  res.status(500).json({ message: 'Login after signup went bad.' });
                  return;
              }
              // Send the user's information to the frontend
              res.status(200).json(aNewUser);
          });
      });
  });
});

authRoutes.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

authRoutes.get('/loggedin', (req, res, next) => {
  if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});

/*authRoutes.post('/edit', (req, res, next) => {
  const {username, campus, course} = req.body
  const userId = req.session.passport.user
  User.findByIdAndUpdate(
    userId, 
    {username, campus, course}, 
    {new: true}, 
    (err, updatedProfile) => {
      if (err) {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
        return;
      }
      res.status(200).json(updatedProfile)
    }
  )
})*/

authRoutes.post('/upload', uploader.single("picture"), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
  const {_id: userId} = req.user
  User.findByIdAndUpdate(
    userId, 
    {picture: req.file.path}, 
    {new: true}, 
    (err, updatedProfile) => {
      if (err) {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
        return;
      }
      res.status(200).json(updatedProfile)
    }
  )
})

module.exports = authRoutes