const mongoose = require("mongoose")

//Це в нас схема прийому,точніше моделька
const appointmentSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    animal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Animal",
        required: true
    },
    appointmentDateTime: {
        type: Date,
        required: true,
    }
})

const Appointment = mongoose.model("Appointment", appointmentSchema, "Appointments")

module.exports = Appointment