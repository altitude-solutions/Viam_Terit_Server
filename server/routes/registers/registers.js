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
const taskCases = ['Tarifario', 'Cotizacion', 'Reserva'];

app.post('/in_data', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['client', 'regional', 'contact', 'via', 'reason', 'nights', 'benefit', 'comments', 'date']);
    let user = req.user;
    body.user = user._id;
    let dataset = new INData(body);

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
});

app.post('/out_data', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['client', 'regional', 'contact', 'via', 'reason', 'result', 'nights', 'benefit', 'comments', 'competition', 'budget', 'estimateNights', 'date']);
    let user = req.user;
    body.user = user._id;
    let dataset = new OUTData(body);

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
});


app.get('/not_tasks', verifyToken, (req, res) => {
    INData.find({
        reason: {
            $nin: taskCases
        }
    }, (err, indatas) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        OUTData.find({
            result: {
                $nin: taskCases
            }
        }, (err, outdatas) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            res.json({
                outdatas,
                indatas
            });
        });
    });
});

module.exports = app;