/**
 *
 * @title:             Tasks CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/


// ===============================================
// Database models
// ===============================================
const Task = require('../../models/Tasks');
const InData = require('../../models/InData');
const OutData = require('../../models/OutData');
const Client = require('../../models/Clients');
const RegionalClient = require('../../models/RegionalClient');
const User = require('../../models/User');
const City = require('../../models/Cities');
const Category = require('../../models/Categories');
const Benefit = require('../../models/Benefits');
const GivenBenefit = require('../../models/GivenBenefits');


// ===============================================
// External modules
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Node nodules
// ===============================================

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');

const errorMessages = {
    notFound: 'Pendiente no encontrado'
}

app.get('/tasks/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    Task.findById(id)
        .populate('client', 'name', Client)
        .populate('regional', 'city category salesAgent socialNetwork', RegionalClient)
        .populate('creationAgent', 'realName email', User)
        .populate('doneAgent', 'realName email', User)
        .populate('inData', 'via reason nights givenBenefits comments date', InData, {}, {
            populate: [{
                path: 'givenBenefits',
                model: GivenBenefit,
                populate: [{
                    path: 'benefit',
                    model: Benefit
                }]
            }]
        })
        .populate('outData', 'via reason result nights benefit comments competition budget estimateNights date', OutData, {}, {
            populate: [{
                path: 'givenBenefits',
                model: GivenBenefit,
                populate: [{
                    path: 'benefit',
                    model: Benefit
                }]
            }]
        })
        .exec((err, task) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            if (!task) {
                return res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            }
            res.json({
                task
            });
        });
});

app.get('/tasks', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;
    let where = {};
    if (req.query.completed) {
        let completed = Number(req.query.completed);
        where.completed = completed;
    }
    if (req.query.deleted) {
        let deleted = Number(req.query.deleted);
        where.deleted = deleted;
    }
    if (req.query.client) {
        where.client = String(req.query.client);
    }

    if (req.query.agent) {
        where.creationAgent = String(req.query.agent);
    }

    // Filter "Reserva"  to fetch tasks that come from "Reservas"
    if (req.query.todo) {
        where.todo = String(req.query.todo);
    }

    let regionalFilter = {};
    if (req.query.region) {
        regionalFilter.city = String(req.query.region);
    }
    if (req.query.category) {
        regionalFilter.category = String(req.query.category);
    }

    Task.find(where)
        .skip(offset)
        .limit(limit)
        .sort([
            ['registerDate', -1]
        ])
        .populate('client', 'name', Client)
        .populate('regional', 'city category salesAgent', RegionalClient, regionalFilter, {
            populate: [{
                path: 'city',
                model: City
            }, {
                path: 'category',
                model: Category
            }]
        })
        .populate('creationAgent', 'realName', User)
        .populate('doneAgent', 'realName', User)
        .populate('inData', 'via reason nights comments date earlyCheckIn lateCheckOut upgrade noShow', InData)
        .populate('outData', 'via reason result nights comments competition budget estimateNights date earlyCheckIn lateCheckOut upgrade noShow', OutData)
        .exec((err, tasks) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            // filter cities and categories
            tasks = tasks.filter(task => {
                return task.regional != null;
            });
            Task.estimatedDocumentCount((err, count) => {
                res.json({
                    tasks,
                    count
                });
            });
        });
});

app.put('/tasks/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['todo', 'creationAgent', 'registerDate', 'completed', 'deleted', 'comment', 'doneDate', 'earlyCheckIn', 'lateCheckOut', 'upgrade', 'noShow', 'nights']);
    if (body.completed != undefined) {
        if (body.doneDate != undefined) {
            let user = req.user;
            body.doneAgent = user._id;
        } else {
            return res.status(400).json({
                err: {
                    message: 'La fecha de finalización es necesaria'
                }
            });
        }
    }
    let benefitsUpdate = {};

    if (body.noShow != undefined) {
        benefitsUpdate.noShow = body.noShow;
        delete body.noShow;
    }

    if (body.earlyCheckIn != undefined) {
        benefitsUpdate.earlyCheckIn = body.earlyCheckIn;
        delete body.earlyCheckIn;
    }

    if (body.lateCheckOut != undefined) {
        benefitsUpdate.lateCheckOut = body.lateCheckOut;
        delete body.lateCheckOut;
    }

    if (body.upgrade != undefined) {
        benefitsUpdate.upgrade = body.upgrade;
        delete body.upgrade;
    }

    if (body.nights != undefined) {
        benefitsUpdate.nights = body.nights;
        delete body.nights;
    }

    Task.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
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
            })
        }
        if (benefitsUpdate == {}) {
            res.json({
                task: updated
            });
        } else {
            let aux = updated.toJSON();
            if (aux.outData) {
                // Comes from an out data
                OutData.findByIdAndUpdate(aux.outData, benefitsUpdate, { new: true, runValidators: true, context: 'query' }, (err, outDataToBeUpdated) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                    res.json({
                        task: updated,
                        outData: outDataToBeUpdated
                    });
                });
            } else {
                // Comes from an in data
                InData.findByIdAndUpdate(aux.inData, benefitsUpdate, { new: true, runValidators: true, context: 'query' }, (err, inDataToBeUpdated) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }
                    res.json({
                        task: updated,
                        inData: inDataToBeUpdated
                    });
                });
            }
        }
    });
});


app.delete('/tasks/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Task.findByIdAndUpdate(id, { deleted: true }, { new: true, runValidators: true, context: 'query' }, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!deleted) {
            return res.status(404).json({
                err: {
                    message: errorMessages.notFound
                }
            })
        }
        res.json({
            task: deleted
        });
    });
});

module.exports = app;