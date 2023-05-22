var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRoute = require("./routes/userRoute")
var animalRoute = require("./routes/animalRoute")
var appointmentRoute = require("./routes/appointmentRoute")

var app = express();

// тут ми підключили монгус для зєднання з базою монгодб,і саме ж зєднання
const mongoose = require('mongoose');
const db = require('./views/database.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//Тут наші роути,які ми підключили в наш модуль app.js
app.use('/user', userRoute)
app.use('/animal', animalRoute)
app.use('/appointment', appointmentRoute)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
