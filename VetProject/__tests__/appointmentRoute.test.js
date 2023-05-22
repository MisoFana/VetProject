const request = require('supertest');
const app = require('../app');
const Appointment = require("../models/appointment")
const Animal = require("../models/animal");
const User = require("../models/user")

describe('appointmentRoute', () => {
    let adminToken;
    let clientId
    let animalId
    let adminId
    let appointmentId
    let appointmentDateTime = Date.now()

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
    let randomClient = generateRandomString(15)

    beforeAll((done) => {
        request(app)
            .post('/user/register')
            .send({
                userName: randomAdmin,
                email: `${randomAdmin}@gmail.com`,
                password: randomAdmin,
                role: "admin"
            })
            .end((err, res) => {
                adminId = res.body.user._id
                done()
            })
    })

    beforeAll((done) => {
        request(app)
            .post('/user/login')
            .send({
                email: `${randomAdmin}@gmail.com`,
                password: randomAdmin
            })
            .end((err, res) => {
                adminToken = res.body.token
                done()
            })
    })

    beforeAll((done) => {
        const client = new User({
            userName: randomClient,
            email: `${randomClient}@gmail.com`,
            password: randomClient,
            role: "client"
        });
        client.save();
        clientId = client._id;
        done();
    })

    beforeAll((done) => {
        const animal = new Animal({
            animalName: 'Max',
            animalInformation: 'A friendly dog',
            animalWeight: 20,
            animalStatus: 'healthy'
        });
        animal.save();
        animalId = animal._id;
        done();
    });

    describe('POST /appointment/create', () => {
        it("should create a new appointment", async () => {
            const res = await request(app)
                .post('/appointment/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    client: clientId,
                    animal: animalId,
                    appointmentDateTime: appointmentDateTime
                })
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toEqual('Appointment created')
        })

        it("should return 400 if not valid appointment", async () => {
            const res = await request(app)
                .post('/appointment/create')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({})
            expect(res.statusCode).toEqual(400);
        })
    })

    describe('PATCH /appointment/update/:id', () => {

        beforeAll((done) => {
            const appointment = new Appointment({
                admin: adminId,
                client: clientId,
                animal: animalId,
                appointmentDateTime: appointmentDateTime
            });
            appointment.save();
            appointmentId = appointment._id;
            done();
        });

        it('should update an existing appointment', async () => {
            const res = await request(app)
                .patch(`/appointment/update/${appointmentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    appointmentDateTime: appointmentDateTime
                });

            expect(res.statusCode).toEqual(200);
        });

        it('should return 404 if appointment ID is invalid', async () => {
            const res = await request(app)
                .patch(`/appointment/update/invalid-id`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    appointmentDateTime: appointmentDateTime
                });

            expect(res.statusCode).toEqual(404);
        });
    });

})