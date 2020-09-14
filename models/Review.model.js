const mongoose = require('mongoose')
const {Schema} = mongoose

const ReviewSchema = new Schema({
  home: {
    type: Schema.Types.ObjectId,
    ref: 'Home'
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  valoration: Number,
  title: String,
  comment: String
})

module.exports = mongoose.model('Review', ReviewSchema)