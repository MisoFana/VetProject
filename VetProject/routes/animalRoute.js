const express = require("express")
const router = express.Router()
const Animal = require("../models/animal")
const jwt = require("jsonwebtoken");
const secretKey = "vet_clinic_user"

//Це в нас провірка чи користувач авторизований
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
        return res.status(401).json({error: "Unauthorized"})
    }

    try {
        const decodedToken = jwt.verify(token, secretKey)
        req.user = decodedToken.user
        next()
    } catch (error) {
        res.status(401).json({error: "Unauthorized"})
    }
}
//це в нас провірка чи користувач клієнт
const clientMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userRole = decodedToken.role
    if (userRole !== 'client') {
        return res.status(403).json({message: 'Forbidden'});
    }
    next();
};
//це в нас провірка чи користувач адмін
const adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userRole = decodedToken.role
    if (userRole !== 'admin') {
        return res.status(403).json({message: 'Forbidden'});
    }
    next();
};
//Це в нас створення тваринки
router.post("/create", authMiddleware, clientMiddleware, async (req, res) => {
    const {animalName, animalInformation, animalWeight, animalStatus} = req.body
    const newAnimal = new Animal({animalName, animalInformation, animalWeight, animalStatus})
    await newAnimal.save()
        .then(admin => {
            res.status(201).json({message: "Animal Created"})
        })
        .catch(err => {
            res.status(400).json({error: err.message})
        })
})
//Це в нас зміна тваринки по айді,наприклад змінити стан тварини або інформацію
router.patch("/update/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["animalDiagnosis", "animalWeight", "animalHeight", "animalBloodType"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: "Invalid updates"})
    }

    try {
        const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if (!animal) {
            return res.status(404).send()
        }

        res.send(animal)
    } catch (e) {
        res.status(404).send(e)
    }
})

//Це в нас видалення тварини з бази
router.delete('/delete/:id', clientMiddleware, async (req, res) => {
    try {
        const animal = await Animal.findByIdAndDelete(req.params.id)
        if (!animal) {
            return res.status(404).send()
        }
        res.send(animal)
    } catch (error) {
        res.status(404).send(error)
    }
})


module.exports = router