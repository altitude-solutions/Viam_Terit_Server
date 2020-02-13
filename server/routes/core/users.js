/**
 *
 * @title:             Users CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/

// ===============================================
// Dabase model
// ===============================================
const User = require('../../models/User');

// ===============================================
// External modules
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');
const bcrypt = require('bcrypt');

// ===============================================
// Node modules
// ===============================================

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');


const errorMessages = {
    notFound: 'El usuario no existe'
}


app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['userName', 'realName', 'email', 'password']);
    body.password = bcrypt.hashSync(body.password, 10);
    let user = new User(body);
    user.save({}, (err, userDb) => {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
            res.json({
                user: userDb
            });
        }
    });
});

app.get('/users/:id', [verifyToken], (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
            if (!user) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            } else {
                res.json({
                    user
                });
            }
        }
    });
});

app.get('/users', [verifyToken], (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 100;

    // exclude  dashboard
    let searchParams = {
        userName: {
            $ne: 'dashboard'
        }
    };

    if (req.query.status) {
        searchParams.status = Number(req.query.status) == 0 ? false : true;
    }

    User.find(searchParams, 'userName realName email')
        .skip(offset)
        .limit(limit)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            } else {
                User.estimatedDocumentCount({}, (err, count) => {
                    if (err) {
                        res.status(500).json({
                            err
                        });
                    }
                    res.json({
                        users,
                        count
                    });
                });
            }
        });
});

app.put('/users/:id', [verifyToken], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['userName', 'realName', 'email', 'password', 'status']);
    if (body.password) {
        body.password = bcrypt.hashSync(body.password, 10);
    }
    User.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                })
            } else {
                res.json({
                    user: updated
                });
            }
        }
    });
});

app.delete('/users/:id', [verifyToken], (req, res) => {
    let id = req.params.id;
    User.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true }, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
            if (!deleted) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            } else {
                res.json({
                    user: deleted
                });
            }
        }
    });
});

module.exports = app;