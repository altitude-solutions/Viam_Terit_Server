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
const Category = require('../../models/Categories');

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


app.post('/categories', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['category']);
    let category = new Category(body);
    category.save((err, saved) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        res.json({
            category: saved
        });
    });
});


app.get('/categories/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Category.findById(id, (err, category) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!category) {
            return res.status(404).json({
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }
        res.json({
            category
        });
    });
});

app.get('/categories', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    Category.find()
        .skip(offset)
        .limit(limit)
        .exec((err, categories) => {
            if (err) {
                res.status(500).json({
                    err
                });
            }
            Category.estimatedDocumentCount({}, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }

                res.json({
                    categories,
                    count
                });
            });
        });
});

app.put('/categories/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['category']);
    Category.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }
        if (!updated) {
            res.status(400).json({
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }
        res.json({
            category: updated
        });
    });
});

app.delete('/categories/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    Category.findByIdAndRemove(id, (err, deleted) => {
        if (err) {
            res.status(500).json({
                err
            });
        }
        res.json({
            category: deleted
        });
    });
});

module.exports = app;