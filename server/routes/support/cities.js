/**
 *
 * @title:             CRUD Cities
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Cities CRUD requests
 *
 **/

// ===============================================
// MongoDB models
// ===============================================
const City = require('../../models/Cities');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');

// ===============================================
// External imports
// ===============================================
const _ = require('underscore');
const express = require('express');
const app = express();

// ===============================================
// Node modules
// ===============================================


app.post('/cities', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['city']);
    let city = new City(body);
    city.save((err, saved) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        res.json({
            city: saved
        });
    });
});

app.get('/cities/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    City.findById(id, (err, city) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!city) {
            return res.status(404).json({
                err: {
                    message: 'Ciudad no encontrada'
                }
            });
        }
        res.json({
            city
        });
    });
});

app.get('/cities', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    City.find()
        .skip(offset)
        .limit(limit)
        .exec((err, cities) => {
            if (err) {
                res.status(500).json({
                    err
                });
            }
            City.estimatedDocumentCount({}, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }
                res.json({
                    cities,
                    count
                });
            });
        });
});

app.put('/cities/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['city']);
    City.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!updated) {
            res.status(400).json({
                err: {
                    message: 'Ciudad no encontrada'
                }
            });
        }
        res.json({
            city: updated
        });
    });
});

app.delete('/cities/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    City.findByIdAndRemove(id, (err, deleted) => {
        if (err) {
            res.status(500).json({
                err
            });
        }
        res.json({
            city: deleted
        });
    });
});

module.exports = app;