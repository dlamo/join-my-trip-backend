const express = require('express')
const homeRouter = express.Router()
const uploader = require('../configs/cloudinary')
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
  const {title, description, image, owner} = req.body
  const home = {
    title,
    description,
    image,
    owner
  }
  try {
    const newHome = await Home.create(home)
    res.json(newHome)
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

homeRouter.delete('/:id', async (req, res, next) => {
  const {id} = req.params
  try {
    const home = await Home.findByIdAndDelete(id)
    res.json(home)
  } catch (error) {
    next(error)
  }
})

module.exports = homeRouter