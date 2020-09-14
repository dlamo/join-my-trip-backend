const express = require('express')
const reviewRouter = express.Router()
const Review = require('../models/Review.model')
const User = require('../models/User.model')

reviewRouter.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find({})
    res.json(reviews)
  } catch (error) {
    next(error)
  }
})

reviewRouter.post('/', async (req, res, next) => {
  const {review} = req.body
  try {
    await Review.create(review)
    const reviewer = await User.findById(review.reviewer)
    const userTrips = reviewer.trips.map(trip => {
      if (trip._id == review.trip) {
        trip.isReviewed = true
        return trip
      } else {
        return trip
      }
    })
    const userUpdated = await User.findByIdAndUpdate(review.reviewer, {trips: userTrips}, {new: true}).populate('home').populate({path: 'trips', populate: {path: 'home', model: 'Home'}})
    res.json(userUpdated)
  } catch (error) {
    next(error)
  }
})

module.exports = reviewRouter