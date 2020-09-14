require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const path         = require('path');
const cors         = require('cors');
const passport      = require('passport');

// Set up the database
require('./configs/db');

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup
app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Session settings
const session = require('./configs/session')
session(app)

// Passport configuration
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = 'Join My Trip';

// cors configuration
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3001', 'http://localhost:3000']
  })
);

const index = require('./routes/index')
const authRoutes = require('./routes/authRoutes')
const homeRoutes = require('./routes/homeRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

app.use('/', index);
app.use('/api/auth', authRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/review', reviewRoutes)

module.exports = app;
