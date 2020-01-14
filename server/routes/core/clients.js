/**
 *
 * @title:             Clients CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/

// ===============================================
// Database model
// ===============================================
const Client = require('../../models/Clients');
const Contact = require('../../models/Contactos');

// ===============================================
// External imports
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Node modules
// ===============================================

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');

const errorMessages = {
    notFound: 'El cliente no existe'
}

app.post('/clients', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['name']);
    let user = req.user;
    let client = new Client(body);
    client.save({}, (err, clientDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            res.json({
                client: clientDB
            });
        }
    });
});

app.get('/clients/:id', [verifyToken], (req, res) => {
    let id = req.params.id;
    let user = req.user;
    Client.findById(id)
        .populate('contacts', 'name job city phoneNumbers emailAddresses', Contact)
        .exec((err, client) => {
            if (err) {
                res.status(500).json({
                    err
                });
            } else {
                if (!client) {
                    res.status(404).json({
                        err: {
                            message: errorMessages.notFound
                        }
                    });
                } else {
                    res.json({
                        client
                    });
                }
            }
        });
});

app.get('/clients', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    let searchParams = {};

    if (req.query.status) {
        searchParams.status = Number(req.query.status) === 0 ? false : true;
    }
    Client.find(searchParams, 'name contacts')
        .skip(offset)
        .limit(limit)
        .populate('contacts', 'name job city phoneNumbers emailAddresses', Contact)
        .exec((err, clients) => {
            if (err) {
                res.status(500).json({
                    err
                })
            } else {
                res.json({
                    clients,
                    count: clients.length
                });
            }
        });
});

app.put('/clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'status', 'contacts']);
    let user = req.user;
    Client.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            res.json(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                })
            } else {
                res.json({
                    client: updated
                });
            }
        }
    });
});

app.delete('/clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    Client.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, deleted) => {
        if (err) {
            res.json(500).json({
                err
            });
        } else {
            if (!deleted) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                })
            } else {
                res.json({
                    client: deleted
                });
            }
        }
    });
});


module.exports = app;