/**
 *
 * @title:             CRUD Benefits
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Benefits CRUD requests
 *
 **/

// ===============================================
// MongoDB models
// ===============================================
const Benefit = require('../../models/Benefits');

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


app.post('/benefits', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['benefit']);
    let benefit = new Benefit(body);
    benefit.save((err, saved) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        res.json({
            benefit: saved
        });
    });
});


app.get('/benefits/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Benefit.findById(id, (err, benefit) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!benefit) {
            return res.status(404).json({
                err: {
                    message: 'Beneficio no encontrado'
                }
            });
        }
        res.json({
            benefit
        });
    });
});

app.get('/benefits', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    Benefit.find()
        .skip(offset)
        .limit(limit)
        .exec((err, benefits) => {
            if (err) {
                res.status(500).json({
                    err
                });
            }
            Benefit.estimatedDocumentCount({}, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }

                res.json({
                    benefits,
                    count
                });
            });
        });
});

app.put('/benefits/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['benefit']);
    Benefit.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!updated) {
            res.status(400).json({
                err: {
                    message: 'Beneficio no encontrado'
                }
            });
        }
        res.json({
            benefit: updated
        });
    });
});

app.delete('/benefits/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Benefit.findByIdAndRemove(id, (err, deleted) => {
        if (err) {
            res.status(500).json({
                err
            });
        }
        res.json({
            benefit: deleted
        });
    });
});

module.exports = app;