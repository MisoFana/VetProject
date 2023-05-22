const mongoose = require("mongoose")

//Це в нас схема користувача
const userScheme = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    //тут ми визначаємо чи користувач адмін чи клієнт на фронт частині.
    role: {
        type: String,
        enum: ["admin", "client"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    animal: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Animal"
    }],
})

const User = mongoose.model("User", userScheme, "Users")

module.exports = User