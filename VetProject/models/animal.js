const mongoose = require("mongoose")

//Це в нас схема,модель тваринки в базі
const animalSchema = new mongoose.Schema({
    animalName: {
        type: String,
        required: true
    },
    animalDiagnosis: {
        type: String,
        required: false
    },
    animalWeight: {
        type: Number,
        required: false
    },
    animalHeight: {
        type: Number,
        required: false
    },
    animalBloodType: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const Animal = mongoose.model("Animal", animalSchema, "Animals")

module.exports = Animal