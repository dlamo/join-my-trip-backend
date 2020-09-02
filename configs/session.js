const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')

module.exports = app => {
  app.use(
    session({
      secret: process.env.SESS_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 600000 }, // === 10 min
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 60 * 60 * 24 // time to live  => 1 day
      })
    })
  )
}