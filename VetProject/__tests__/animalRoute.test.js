const request = require('supertest');
const app = require('../app');
const Animal = require("../models/animal")

describe('animalRoute', () => {
    let clientToken;
    let adminToken;
    let animalId;

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
                done()
            })
    })

    beforeAll((done) => {
        request(app)
            .post('/user/register')
            .send({
                userName: randomClient,
                email: `${randomClient}@gmail.com`,
                password: randomClient,
                role: "client"
            })
            .end((err, res) => {
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
                adminToken = res.body.token;
                done();
            });
    });

    beforeAll((done) => {
        request(app)
            .post('/user/login')
            .send({
                email: `${randomClient}@gmail.com`,
                password: randomClient
            })
            .end((err, res) => {
                clientToken = res.body.token;
                done();
            });
    });

    describe('POST /animal/create', () => {
        it('should create a new animal', async () => {
            const res = await request(app)
                .post('/animal/create')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({
                    animalName: 'Fluffy',
                    animalInformation: 'A cute little kitten',
                    animalWeight: 1.5,
                    animalStatus: 'healthy'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toEqual('Animal Created');
        });
    });

    describe('PATCH /animal/update/:id', () => {

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

        it('should update an existing animal', async () => {
            const res = await request(app)
                .patch(`/animal/update/${animalId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    animalDiagnosis: 'Cancer'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.animalDiagnosis).toEqual('Cancer');
        });

        it('should return 404 if animal ID is invalid', async () => {
            const res = await request(app)
                .patch(`/animal/update/invalid-id`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    animalDiagnosis: 'Cancer'
                });

            expect(res.statusCode).toEqual(404);
        });
    });
    describe('DELETE /animal/delete/:id', () => {
        it("should delete an existing animal", async () => {
            const res = await request(app)
                .delete(`/animal/delete/${animalId}`)
                .set('Authorization', `Bearer ${clientToken}`)

            expect(res.statusCode).toEqual(200)
        })

        it("should return 404 if animal ID is invalid", async () => {
            const res = await request(app)
                .delete(`/animal/delete/invalid-id`)
                .set('Authorization', `Bearer ${clientToken}`)

            expect(res.statusCode).toEqual(404)
        })
    })
});
