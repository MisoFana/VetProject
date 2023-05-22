const request = require('supertest');
const app = require('../app');
const User = require("../models/user")

describe('userRoute', () => {
    //Це в нас генерація рандомного стрінга для того,щоб коли відбувався тест,користувачі не повторялися
    function generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    let randomAdmin = generateRandomString(15)
    let adminToken
    let randomClient = generateRandomString(15)
    let clientToken

    describe('POST /user/register', () => {
        it("should register a new user", async () => {
            const res = await request(app)
                .post('/user/register')
                .send({
                    userName: randomAdmin,
                    email: `${randomAdmin}@gmail.com`,
                    password: randomAdmin,
                    role: "admin"
                })
            expect(res.statusCode).toEqual(201)
            expect(res.body.message).toEqual("User Created")
        })
        it("should return 400 if user is invalid", async () => {
            const res = await request(app)
                .post('/user/register')
                .send({
                    email: `${randomAdmin}@gmail.com`,
                    password: randomAdmin,
                    role: "admin"
                })
            expect(res.statusCode).toEqual(400)
        })
        it("should register a new user", async () => {
            const res = await request(app)
                .post('/user/register')
                .send({
                    userName: randomClient,
                    email: `${randomClient}@gmail.com`,
                    password: randomClient,
                    role: "client"
                })
            expect(res.statusCode).toEqual(201)
            expect(res.body.message).toEqual("User Created")
        })
    })
    describe('POST /user/login/', () => {
        it("should login user", async () => {
            const res = await request(app)
                .post('/user/login')
                .send({
                    email: `${randomAdmin}@gmail.com`,
                    password: randomAdmin
                })

            adminToken = res.body.token

            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty("token")
        })
        it("should return 401 if unauthorized", async () => {
            const res = await request(app)
                .post('/user/login')
                .send({
                    email: "invalidUser@gmail.com",
                    password: "invalidPassword"
                })

            expect(res.statusCode).toEqual(401)
        })
        it("should login user", async () => {
            const res = await request(app)
                .post('/user/login')
                .send({
                    email: `${randomClient}@gmail.com`,
                    password: randomClient
                })

            clientToken = res.body.token

            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty("token")
        })
    })

    describe('GET /user/admin-profile', () => {
        it("should return admin", async () => {
            const res = await request(app)
                .get('/user/admin-profile')
                .set('Authorization', `Bearer ${adminToken}`)

            expect(res.statusCode).toEqual(200)
        })
        it("should return 403 if token is invalid", async () => {
            const res = await request(app)
                .get('/user/admin-profile')
                .set('Authorization', `Bearer ${clientToken}`)

            expect(res.statusCode).toEqual(403)
            expect(res.body.message).toEqual("Forbidden")
        })
    })
})
