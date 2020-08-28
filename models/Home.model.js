const mongoose = require('mongoose')
const {Schema} = mongoose

const HomeSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  picture: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  savedDates: [[String]]
})

module.exports = mongoose.model('Home', HomeSchema)