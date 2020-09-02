const express = require('express')
const homeRouter = express.Router()
const uploader = require('../configs/cloudinary')
const axios = require('axios')
const unidecode = require('unidecode')
const User = require('../models/User.model')
const Home = require('../models/Home.model')

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
    const user = await User.findByIdAndUpdate(owner, {home: newHome._id}, {new: true})
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
  const userId = req.session.passport.user
  const trip = {
    dates: savedDates,
    home: homeId
  }
  try {
    const saveDates = Home.findByIdAndUpdate(homeId, {$push: {savedDates: savedDates}})
    const saveTrip = User.findByIdAndUpdate(userId, {$push: {trips: trip}}, {new: true})
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
    const queryParams = 'inputtype=textquery&fields=formatted_address,geometry,place_id'
    const {data} = await axios.get(`${path}?${queryParams}&key=${process.env.googleCloudKey}&input=${location}`)
    res.json(data.candidates)
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

module.exports = homeRouter