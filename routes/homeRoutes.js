const express = require('express')
const homeRouter = express.Router()
const uploader = require('../configs/cloudinary')
const axios = require('axios')
const unidecode = require('unidecode')
const User = require('../models/User.model')
const Home = require('../models/Home.model')
const {transporter, saveDates} = require('../configs/nodemailer')

homeRouter.get('/', async (req, res, next) => {
  try {
    const homes = await Home.find({})
    res.json(homes)
  } catch (error) {
    next(error)
  }
})

homeRouter.post('/', async (req, res, next) => {
  const {title, description, pictures, conditions, location, owner} = req.body
  const home = {
    title,
    description,
    pictures,
    conditions, 
    location,
    owner
  }
  try {
    const newHome = await Home.create(home)
    const user = await User.findByIdAndUpdate(owner, {home: newHome._id}, {new: true}).populate('home').populate({path: 'trips', populate: {path: 'home', model: 'Home'}})
    res.json(user)
  } catch (error) {
    next(error)
  }
})

homeRouter.delete('/:id', async (req, res, next) => {
  const {id} = req.params
  try {
    const home = await Home.findByIdAndDelete(id)
    res.json(home)
  } catch (error) {
    next(error)
  }
})

homeRouter.post('/upload', uploader.array("picture"), (req, res, next) => {
  if (!req.files) {
    next(new Error('No file(s) uploaded!'));
    return;
  }
  const pictures = req.files.length ? Array.from(req.files).map(file => file.path) : undefined
  res.json(pictures)
})

homeRouter.put('/save-dates/:id', async (req, res, next) => {
  const {id: homeId} = req.params
  const savedDates = req.body
  const userId = req.user
  const trip = {
    dates: savedDates,
    home: homeId,
    isReviewed: false
  }
  try {
    req.user
    const saveDates = Home.findByIdAndUpdate(homeId, {$push: {savedDates: {$each: [...savedDates]}}})
    const saveTrip = User.findByIdAndUpdate(userId, {$push: {trips: trip}}, {new: true}).populate('home').populate({path: 'trips', populate: {path: 'home', model: 'Home'}})
    const [,userUpdated] = await Promise.all([saveDates, saveTrip])
    res.json(userUpdated)
  } catch (error) {
    next(error)
  }
})

homeRouter.get('/location', async (req, res, next) => {
  const location = unidecode(req.query.search)
  try {
    const path = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    const queryParams = 'inputtype=textquery&language=en&fields=formatted_address,geometry,place_id'
    const {data} = await axios.get(`${path}?${queryParams}&key=${process.env.googleCloudKey}&input=${location}`)
    res.json(data.candidates)
  } catch (error) {
    next(error)
  }
})

homeRouter.post('/search', async (req, res, next) => {
  const {dates} = req.body
  const city = unidecode(req.query.city)
  try {
    const homes = await Home.find({'location.region': city, 'savedDates': {'$nin': [...dates]}})
    res.json(homes)
  } catch (error) {
    next(error)
  }
})

homeRouter.get('/random', async (req, res, next) => {
  try {
    const homes = await Home.aggregate([{ $sample: { size: 2 } }])
    res.json(homes)
  } catch (error) {
    next(error)
  }
})

homeRouter.get('/:id', async (req, res, next) => {
  const {id} = req.params
  try {
    const home = await Home.findById(id)
    res.json(home)
  } catch (error) {
    next(error)
  }
})

homeRouter.post('/dates-email', async (req, res, next) => {
  const {emailData} = req.body
  const {host: hostId, guest, startDate, endDate, message, guestEmail} = emailData
  try {
    const {username: host, email: hostEmail} = await User.findById(hostId)
    await transporter.sendMail({
      from: process.env.APPMAIL_ACCOUNT,
      to: hostEmail,
      subject: 'Join My Trip: New book at your home',
      html: saveDates(host, guest, startDate, endDate, message, guestEmail)
    }, (error, info) => error ? console.log(error) : res.json({message: 'Email sent: ' + info.response}))
  } catch (error) {
    next(error)
  }
})

module.exports = homeRouter