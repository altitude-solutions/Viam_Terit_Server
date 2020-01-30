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
const Contact = require('../../models/Contacts');
const RegionalClient = require('../../models/RegionalClient');

// ===============================================
// External models
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Node modules
// ===============================================

// ===============================================
// Moddlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');

const errorMessages = {
    notFound: 'El contacto no existe'
}


app.post('/contacts', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['name', 'job', 'phoneNumbers', 'emailAddresses']);
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
    Contact.findById(id, (err, contact) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (!contact) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
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

    Contact.find(searchParams, 'name job phoneNumbers emailAddresses primary')
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
    if (id == 'set_as_default') {
        let regional = req.query.regional;
        let contact = req.query.contact;
        if (contact == undefined || contact == '') {
            return res.status(400).json({
                err: {
                    message: 'Por favor seleccione un contacto'
                }
            });
        }
        if (regional == undefined || regional == '') {
            return res.status(400).json({
                err: {
                    message: 'Por favor seleccione una regional'
                }
            });
        }
        RegionalClient.findById(regional, (err, regionalAppend) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            if (!regionalAppend) {
                return res.status(404).json({
                    err: {
                        message: 'Por favor seleccione una regional válida'
                    }
                });
            }
            let contacts = regionalAppend.contacts;
            if (contacts.includes(contact)) {
                Contact.updateMany({
                    _id: {
                        $in: contacts
                    }
                }, {
                    primary: false
                }, (err, allFalse) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                });
                Contact.findByIdAndUpdate(contact, { primary: true }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                    if (!updated) {
                        return res.status(404).json({
                            err: {
                                message: 'Contacto no encontrado'
                            }
                        });
                    }
                    res.json({
                        contact: updated
                    });
                });
            } else {
                return res.status(400).json({
                    err: {
                        message: 'El contacto seleccionado no pertenece a la regional seleccionada'
                    }
                });
            }
        });
    } else {
        let body = _.pick(req.body, ['name', 'job', 'phoneNumbers', 'emailAddresses', 'status', 'birthday']);

        Contact.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
            if (err) {
                res.status(500).json({
                    err
                });
            } else {
                if (!updated) {
                    res.status(404).json({
                        err: {
                            message: errorMessages.notFound
                        }
                    });
                } else {
                    res.json({
                        contact: updated
                    });
                }
            }
        });
    }
});

app.delete('/contacts/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Contact.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
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