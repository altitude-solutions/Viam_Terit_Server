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
const Client = require('../../models/Clients');
const RegionalClient = require('../../models/RegionalClient');
const User = require('../../models/User');


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
        .populate('regional', 'city', RegionalClient)
        .populate('creationAgent', 'realName', User)
        .populate('doneAgent', 'realName', User)
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
    let offset = req.query.from || 0;
    let limit = req.query.to || 1000;
    let where = {};
    if (req.query.completed) {
        let completed = Number(req.query.completed)
        where.completed = completed
    }
    if (req.query.deleted) {
        let deleted = Number(req.query.deleted)
        where.deleted = deleted
    }
    if (req.query.client) {
        where.client = String(req.query.client);
    }

    if (req.query.region) {
        where.regional = String(req.query.region);
    }

    if (req.query.agent) {
        where.creationAgent = String(req.query.agent);
    }

    Task.find(where)
        .skip(offset)
        .limit(limit)
        .populate('client', 'name', Client)
        .populate('regional', 'city', RegionalClient)
        .populate('creationAgent', 'realName', User)
        .populate('doneAgent', 'realName', User)
        .exec((err, tasks) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            res.json({
                tasks,
                count: tasks.length
            });
        });
});


app.put('/tasks/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['client', 'regional', 'todo', 'creationAgent', 'registerDate', 'completed', 'deleted', 'comment', 'doneDate']);

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

        res.json({
            task: updated
        });
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