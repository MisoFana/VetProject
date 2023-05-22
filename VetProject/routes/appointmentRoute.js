const express = require('express')
const router = express.Router()
const Appointment = require('../models/appointment')
const jwt = require("jsonwebtoken")
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

// Це в нас провірка чи користувач адмін
const authorizeAdmin = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userRole = decodedToken.role
    if (userRole !== 'admin') {
        return res.status(403).json({message: 'Forbidden'});
    }
    next();
};

//Це в нас створення прийому,де вписується айді адміна автоматично з jwt токена
router.post('/create', authMiddleware, authorizeAdmin, async (req, res) => {
    const {user, animal, appointmentDateTime} = req.body
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userId = decodedToken.userId
    const appointment = new Appointment({
        admin: userId,
        user,
        animal,
        appointmentDateTime,
    });

    await appointment.save()
        .then((appointment) => {
            res.status(201).json({message: 'Appointment created', appointment})
        })
        .catch(err => {
            res.status(400).json({error: err.message})
        })
});

//Це в нас апдейт прийому,точніше зміна години,бо можливо хтось там неможе прийти і перенесе годину
router.patch("/update/:id", authMiddleware, authorizeAdmin, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["appointmentDateTime"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: "Invalid updates"})
    }

    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if (!appointment) {
            return res.status(404).send()
        }

        res.send(appointment)
    } catch (e) {
        res.status(404).send(e)
    }
})


module.exports = router;
