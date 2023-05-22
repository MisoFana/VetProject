const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://doctor:I3Rgz8cXerOhrHmn@vetclinic.auzqijg.mongodb.net/?retryWrites=true&w=majority"
).then(() => console.log("Connected")).catch(() => console.log("Error"));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('connected', () => {
    console.log('Connected to MongoDB database');
});

const { User } = require("../models/user")
const { Animal } = require("../models/animal")
const { Appointment } = require("../models/appointment")

module.exports = { db, User, Animal, Appointment };
