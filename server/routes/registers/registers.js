/**
 *
 * @title:             Dataset CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/

// ===============================================
// Database Models
// ===============================================
const INData = require('../../models/InData');
const OUTData = require('../../models/OutData');
const Task = require('../../models/Tasks');
const GivenBenefit = require('../../models/GivenBenefits');
const Client = require('../../models/Clients');
const RegionalClient = require('../../models/RegionalClient');
const Contacts = require('../../models/Contacts');
const Cities = require('../../models/Cities');
const Categories = require('../../models/Categories');
const Users = require('../../models/User');

// ===============================================
// External modules
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
    clientNotFound: 'Seleccione un cliente por favor',
    contactNotFound: 'Seleccione un contacto por favor',
    regionalNotFound: 'Seleccione un regional por favor'
}

// ===============================================
// Change this array to change which cases generate a task
// ===============================================
const taskCases = ['Tarifario', 'Cotizacion', 'Reserva', 'PuntodeVenta'];

app.post('/in_data', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['client', 'regional', 'contact', 'via', 'reason', 'nights', 'restaurant', 'events', 'other', 'comments', 'date', 'earlyCheckIn', 'lateCheckOut', 'upgrade', 'noShow']);
    let user = req.user;
    body.user = user._id;

    if (body.client == '') {
        return res.status(404).json({
            err: {
                message: errorMessages.clientNotFound
            }
        });
    }
    if (body.regional == '') {
        return res.status(404).json({
            err: {
                message: errorMessages.regionalNotFound
            }
        });
    }
    if (body.contact == '') {
        return res.status(404).json({
            err: {
                message: errorMessages.contactNotFound
            }
        });
    }

    let dataset = new INData(body);
    dataset.save({}, (err, inDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (taskCases.includes(inDB.reason)) {
                taskBody = {
                    client: body.client,
                    regional: body.regional,
                    inData: inDB._id,
                    todo: inDB.reason,
                    creationAgent: body.user,
                    registerDate: body.date,
                    comment: body.comments
                }
                let generatedTask = new Task(taskBody);
                generatedTask.save((err, task) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                    res.json({
                        inData: inDB,
                        task
                    });
                });
            } else {
                res.json({
                    inData: inDB
                });
            }
        }
    });
    // }
});

app.post('/out_data', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['client', 'regional', 'contact', 'via', 'reason', 'result', 'nights', 'comments', 'competition', 'budget', 'estimateNights', 'restaurant', 'events', 'other', 'date', 'earlyCheckIn', 'lateCheckOut', 'upgrade', 'noShow']);
    let user = req.user;
    body.user = user._id;

    // let benefitsToBeGiven = [];
    // if (body.givenBenefits) {
    //     benefitsToBeGiven = body.givenBenefits;
    //     delete body.givenBenefits;
    // }

    if (body.client == '') {
        return res.status(404).json({
            err: {
                message: errorMessages.clientNotFound
            }
        });
    }

    if (body.contact == '') {
        return res.status(404).json({
            err: {
                message: errorMessages.contactNotFound
            }
        });
    }

    let dataset = new OUTData(body);
    dataset.save({}, (err, outDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            if (taskCases.includes(outDB.result)) {
                taskBody = {
                    client: body.client,
                    regional: body.regional,
                    outData: outDB._id,
                    todo: outDB.result,
                    creationAgent: body.user,
                    registerDate: body.date,
                    comment: body.comments
                }
                let generatedTask = new Task(taskBody);

                generatedTask.save((err, task) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }

                    res.json({
                        outData: outDB,
                        task
                    });
                });
            } else {
                res.json({
                    outData: outDB
                });
            }
        }
    });
    // }
});


app.get('/not_tasks/:source', verifyToken, (req, res) => {
    let source = req.params.source;
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 100;

    if (source == '' || source == undefined) {
        return res.status(400).json({
            err: {
                message: 'La fuente es necesaria'
            }
        });
    } else {
        if (source == 'input') {
            INData.find({
                    reason: {
                        $nin: taskCases
                    }
                })
                .skip(from)
                .limit(limit)
                .sort([
                    ['date', -1]
                ])
                .populate('client', 'name', Client)
                .populate('regional', 'city category salesAgent socialNetwork anniversary', RegionalClient, {}, {
                    populate: [{
                        path: 'city',
                        model: Cities
                    }, {
                        path: 'category',
                        model: Categories
                    }, {
                        path: 'salesAgent',
                        model: Users
                    }]
                })
                .populate('contact', 'name job phoneNumbers emailAddresses birthday', Contacts)
                .populate('user', 'realName userName email', Users)
                .exec((err, indatas) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                    INData.countDocuments({
                        reason: {
                            $nin: taskCases
                        }
                    }, (err, count) => {
                        if (err) {
                            res.status(500).json({
                                err
                            });
                        }
                        res.json({
                            data: indatas,
                            count
                        });
                    });
                });
        } else {
            if (source == 'output') {
                OUTData.find({
                        result: {
                            $nin: taskCases
                        }
                    })
                    .skip(from)
                    .limit(limit)
                    .sort([
                        ['date', -1]
                    ])
                    .populate('client', 'name', Client)
                    .populate('regional', 'city category salesAgent socialNetwork anniversary', RegionalClient, {}, {
                        populate: [{
                            path: 'city',
                            model: Cities
                        }, {
                            path: 'category',
                            model: Categories
                        }, {
                            path: 'salesAgent',
                            model: Users
                        }]
                    })
                    .populate('contact', 'name job phoneNumbers emailAddresses birthday', Contacts)
                    .populate('user', 'realName userName email', Users)
                    .exec((err, outdatas) => {
                        if (err) {
                            return res.status(500).json({
                                err
                            });
                        }
                        OUTData.countDocuments({
                            reason: {
                                $nin: taskCases
                            }
                        }, (err, count) => {
                            if (err) {
                                return res.status(500).json({
                                    err
                                });
                            }
                            res.json({
                                data: outdatas,
                                count
                            });
                        });
                    });
            } else {
                return res.status(400).json({
                    err: {
                        message: 'La fuente es inválida'
                    }
                });
            }
        }
    }
});

module.exports = app;