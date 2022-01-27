
var createError = require('http-errors');
const express = require('express');
const path = require('path');
const mysql = require("mysql");
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const multer  = require('multer')


const indexRouter = require('./routes/index');
const categoryRouter = require('./routes/category');
const registerRouter = require('./routes/register');
const medicineRouter = require('./routes/medicine');
const attributeRouter = require('./routes/attribute');
const deliveryeRouter = require('./routes/delivery');
const bannerRouter = require('./routes/banner');
const usersRouter = require('./routes/usersRegistration');
const apiRouter = require('./routes/api');


require('dotenv').config();
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended:false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/', categoryRouter);
app.use('/', registerRouter);
app.use('/', medicineRouter);
app.use('/', attributeRouter);
app.use('/', deliveryeRouter);
app.use('/', bannerRouter);
app.use('/', usersRouter);
app.use('/', apiRouter);









module.exports = app;
