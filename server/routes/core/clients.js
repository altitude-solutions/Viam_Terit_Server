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
const xlsx = require('xlsx');
const fileUpload = require('express-fileupload');

// ===============================================
// Node modules
// ===============================================
const path = require('path');
const fs = require('fs');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');
app.use(fileUpload());


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
    let body = _.pick(req.body, ['city', 'category', 'contacts', 'salesAgent', 'socialNetwork', 'status']);

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


// ===============================================
// FIXME(remove this useless function)
// ===============================================
app.post('/app_clients', verifyToken, (req, res) => {
    let user = req.user;
    let body = _.pick(req.body, ['contact', 'regional', 'client']);

    let contact = new Contact(body.contact);
    contact.save((err, contactDB) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        body.regional.contacts = [contactDB._id];
        body.regional.salesAgent = user._id;

        let regional = new RegionalClient(body.regional);
        regional.save((err, regionalDB) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            body.client.regionals = [regionalDB._id];

            let client = new Client(body.client);
            client.save((err, clientDB) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }

                res.json({
                    client: clientDB
                });
            });
        });
    });
});


module.exports = app;