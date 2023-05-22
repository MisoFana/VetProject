const express = require("express")
const router = express.Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

const secretKey = "vet_clinic_user"

//Це в нас іде реєстрація користувача
router.post("/register", async (req, res) => {
    const {userName, email, password, role} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({userName, email, password: hashedPassword, role})
    await newUser.save()
        .then(async (user) => {
            res.status(201).json({message: "User Created", user})
        })
        .catch(err => {
            res.status(400).json({error: err.message})
        })
})

//Це в нас авторизація користувача
router.post("/login", async (req, res) => {
    const {email, password} = req.body
    const user = await User.findOne({email})

    if (!user) {
        return res.status(401).json({error: "Invalid email or password"})
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
        return res.status(401).json({error: "Invalid email or password"})
    }

    const token = jwt.sign({userId: user._id, role: user.role}, secretKey)

    res.json({token})


})

//Це в нас провірка на те,чи користувач авторизований
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

//Це в нас провірка чи користувач адмін(лікар)
const authorizeAdmin = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userRole = decodedToken.role
    if (userRole !== 'admin') {
        return res.status(403).json({message: 'Forbidden'});
    }
    next();
};

//Це в нас провірка чи користувач клієнт
const authorizeClient = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const userRole = decodedToken.role
    if (userRole !== 'client') {
        return res.status(403).json({message: 'Forbidden'});
    }
    next();
};

//Це в нас получення даних для профілю для адміна
router.get('/admin-profile', authorizeAdmin, authMiddleware, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const adminId = decodedToken.userId
    await User.findById(adminId)
        .then((users) => {
            res.json(users)
        })
        .catch((error) => {
            console.log("Error", error)
            res.status(400).json({error: "Error"})
        })
})

//Це в нас получення даних для профілю клієнта
router.get('/client-profile', authorizeClient, authMiddleware, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, secretKey)
    const clientId = decodedToken.userId
    await User.find(clientId)
        .then((users) => {
            res.json(users)
        })
        .catch((error) => {
            console.log("Error", error)
            res.status(400).json({error: "Error"})
        })
})

module.exports = router