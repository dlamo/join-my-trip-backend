const express = require('express')
const authRouter = express.Router()
const passport = require('passport')
const uploader = require('../configs/cloudinary')
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10);
const User = require('../models/User.model')
const Review = require('../models/Review.model')
const {transporter, question} = require('../configs/nodemailer')

authRouter.post('/login', (req, res, next) => {
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

authRouter.get('/user', (req, res, next) => {
  res.json({user: req.user})
})

authRouter.post('/signup', (req, res, next) => {
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

authRouter.post('/logout', (req, res, next) => {
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

authRouter.get('/loggedin', (req, res, next) => {
  if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});

authRouter.put('/edit', (req, res, next) => {
  const {name, country, languages, isCompleted} = req.body
  const userId = req.session.passport.user
  User.findByIdAndUpdate(
    userId, 
    {name, country, languages, isCompleted}, 
    {new: true})
    .populate('home').populate({path: 'trips', populate: {path: 'home', model: 'Home'}}) 
    .exec((err, updatedProfile) => {
      if (err) {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
        return;
      }
      res.status(200).json(updatedProfile)
    }
  )
})

authRouter.post('/upload', uploader.single("picture"), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
  const {_id: userId} = req.user
  User.findByIdAndUpdate(
    userId, 
    {picture: req.file.path}, 
    {new: true})
    .populate('home').populate({path: 'trips', populate: {path: 'home', model: 'Home'}}) 
    .exec((err, updatedProfile) => {
      if (err) {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
        return;
      }
      res.status(200).json(updatedProfile)
    }
    )
})

authRouter.get('/user/:id', async (req, res, next) => {
  const {id} = req.params
  try {
    const getUser = User.findById(id)
    const getReviews = Review.find({host: id})
    const [user, reviews] = await Promise.all([getUser, getReviews])
    user.password = undefined
    user.trips = undefined
    res.json({user, reviews})
  } catch (error) {
    next(error)
  }
})

authRouter.post('/user-email', async (req, res, next) => {
  const {emailData} = req.body
  const {host, user, message, guestEmail, hostEmail} = emailData
  try {
    await transporter.sendMail({
      from: process.env.APPMAIL_ACCOUNT,
      to: hostEmail,
      subject: 'Join My Trip: A user wants to ask you',
      html: question(host, user, message, guestEmail)
    }, (error, info) => error ? console.log(error) : res.json({message: 'Email sent succesfully'}))
  } catch (error) {
    next(error)
  }
})

module.exports = authRouter