/**
 *
 * @title:             Contacts CRUD
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
const Contact = require('../../models/Contactos');

// ===============================================
// External models
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');
const bcrypt = require('bcrypt');

// ===============================================
// Node modules
// ===============================================

// ===============================================
// Moddlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');


app.post('/contacts', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['name', 'job', 'city', 'phoneNumbers', 'emailAddresses']);
    let user = req.user;
    let contact = new Contact(body);
    contact.save({}, (err, contactDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            res.json({
                contact: contactDB
            });
        }
    });
});

app.get('/contacts/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    Contact.findById(id, (err, contact) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (!contact) {
                res.status(404).json({
                    err: {
                        message: 'Contact not found'
                    }
                });
            } else {
                res.json({
                    contact
                });
            }
        }
    });
});

app.get('/contacts', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    let searchParams = {};

    if (req.query.status) {
        searchParams.status = Number(req.query.status) === 0 ? false : true;
    }

    Contact.find(searchParams, 'name job city phoneNumbers emailAddresses')
        .skip(offset)
        .limit(limit)
        .exec((err, contacts) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            } else {
                res.json({
                    contacts,
                    count: contacts.length
                });
            }
        });
});

app.put('/contacts/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let user = req.user;
    Contact.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: 'Contact not found'
                    }
                });
            } else {
                res.json({
                    contact: updated
                });
            }
        }
    });
});

app.delete('/contacts/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    Contact.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: 'Contact not found'
                    }
                });
            } else {
                res.json({
                    contact: updated
                });
            }
        }
    });
});


module.exports = app;