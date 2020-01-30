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
const RegionalClient = require('../../models/RegionalClient');
const Contact = require('../../models/Contacts');
const User = require('../../models/User');
const Category = require('../../models/Categories');
const City = require('../../models/Cities');

// ===============================================
// External imports
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');


const errorMessages = {
    notFound: 'El cliente no existe'
}

app.post('/clients', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['name', 'regionals']);
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
    Client.findById(id)
        .populate('regionals', 'city category contacts salesAgent socialNetwork', RegionalClient, {
            status: true
        }, {
            populate: [{
                path: 'contacts',
                select: 'name job phoneNumbers emailAddresses primary',
                model: Contact,
                match: {
                    status: true
                }
            }, {
                path: 'salesAgent',
                select: 'realName email',
                model: User,
                match: {
                    status: true
                }
            }, {
                path: 'category',
                model: Category
            }, {
                path: 'city',
                model: City
            }]
        })
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
    // Regular expression query to look for clients by name
    if (req.query.q) {
        searchParams.name = RegExp(req.query.q, 'iu');
    }

    Client.find(searchParams, 'name regionals')
        .skip(offset)
        .limit(limit)
        .populate('regionals', 'city category contacts salesAgent socialNetwork', RegionalClient, {
            status: true
        }, {
            populate: [{
                path: 'contacts',
                select: 'name job phoneNumbers emailAddresses primary',
                model: Contact,
                match: {
                    status: true
                }
            }, {
                path: 'salesAgent',
                select: 'realName email',
                model: User,
                match: {
                    status: true
                }
            }, {
                path: 'category',
                model: Category
            }, {
                path: 'city',
                model: City
            }]
        })
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
    if (id == "append_regional") {
        let regional = req.query.regional;
        let client = req.query.client;
        if (regional == undefined || regional == '') {
            return res.status(400).json({
                err: {
                    message: 'Por favor seleccione una regional'
                }
            });
        }
        if (client == undefined || client == '') {
            return res.status(400).json({
                err: {
                    message: 'Por favor seleccione un cliente'
                }
            });
        }
        Client.findById(client, (err, clientFound) => {
            if (err) {
                res.status(500).json({
                    err
                });
            }
            let regionals = clientFound.toJSON().regionals;
            regionals.push(regional);
            Client.findByIdAndUpdate(client, { regionals }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }
                res.json({
                    client: updated
                });
            });
        });
    } else {
        let body = _.pick(req.body, ['name', 'status', 'regionals']);
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
                    });
                } else {
                    res.json({
                        client: updated
                    });
                }
            }
        });
    }
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

app.post('/regional_clients', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['city', 'category', 'contacts', 'salesAgent', 'socialNetwork']);

    if (!body.salesAgent) {
        let user = req.user;
        body.salesAgent = user._id;
    }

    let regionalClient = new RegionalClient(body);
    regionalClient.save((err, saved) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        res.json({
            regional_client: saved
        });
    });
});

app.get('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    RegionalClient.findById(id)
        .populate('contacts', 'name job phoneNumbers emailAddresses primary', Contact, {
            status: true
        })
        .populate('salesAgent', 'realName email', User, {
            status: true
        })
        .populate('category', 'category', Category)
        .populate('city', 'city', City)
        .exec((err, regional_client) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }

            if (!regional_client) {
                return res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            }

            res.json({
                regional_client
            });
        });
});

app.get('/regional_clients', verifyToken, (req, res) => {
    let offset = req.query.from || 0;
    let limit = req.query.to || 1000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.status = status === 0 ? false : true;
    }

    RegionalClient.find(where, 'city category contacts salesAgent')
        .skip(offset)
        .limit(limit)
        .populate('contacts', 'name job phoneNumbers emailAddresses primary', Contact, {
            status: true
        })
        .populate('salesAgent', 'realName email', User, {
            status: true
        })
        .populate('category', 'category', Category)
        .populate('city', 'city', City)
        .exec((err, regional_clients) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }

            res.json({
                regional_clients,
                count: regional_clients.length
            });
        });
});

app.put('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    if (id == "append_contact") {
        let contact = req.query.contact;
        let regional = req.query.regional;
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
        RegionalClient.findById(regional, (err, regionalFound) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            let contacts = regionalFound.toJSON().contacts;
            contacts.push(contact);
            RegionalClient.findByIdAndUpdate(regional, { contacts }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }
                res.json({
                    regional_client: updated
                });
            });
        });
    } else {
        let body = _.pick(req.body, ['city', 'category', 'contacts', 'salesAgent', 'socialNetwork', 'status', 'anniversary']);
        RegionalClient.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }

            if (!updated) {
                return res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            }

            res.json({
                regional_client: updated
            });
        });
    }
});

app.delete('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    RegionalClient.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        if (!updated) {
            return res.status(404).json({
                err: {
                    message: errorMessages.notFound
                }
            });
        }

        res.json({
            regional_client: updated
        });
    });
});

module.exports = app;