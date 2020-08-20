const mongoose = require('mongoose')
const {Schema} = mongoose

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is mandatory!']
  },
  email: {
    type: String,
    required: [true, 'Valid email is mandatory!'],
    match: [/^\S+@\S+\.\S+$/, "Invalid email."],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: String,
  picture: {
    type: String,
    default: 'https://banner2.cleanpng.com/20180603/jx/kisspng-user-interface-design-computer-icons-default-stephen-salazar-photography-5b1462e1b19d70.1261504615280626897275.jpg'
  },
  country: String,
  languages: [String],
  birth: Date,
  isCompleted: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('User', UserSchema)