/**
 *
 * @title:             Login
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Description
 *
 **/

// ===============================================
// Database models
// ===============================================
const User = require('../../models/User');

// ===============================================
// Node modules
// ===============================================

// ===============================================
// External imports
// ===============================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const express = require('express');
const app = express();


app.post('/login', (req, res) => {
    let body = _.pick(req.body, ['userName', 'password']);
    User.findOne({
        userName: body.userName
    }, (err, user) => {
        if (err) {
            return res.status(500).json({
                err
            });
        } else {
            if (!user) {
                res.status(400).json({
                    err: {
                        message: 'Incorrect username or password'
                    }
                });
            } else {
                if (!bcrypt.compareSync(body.password, user.password)) {
                    res.status(400).json({
                        err: {
                            message: 'Incorrect username or password'
                        }
                    });
                } else {
                    let token = jwt.sign({
                            user
                        },
                        process.env.SEED, {
                            expiresIn: process.env.CADUCIDAD_TOKEN
                        });

                    res.json({
                        user,
                        token
                    });
                }
            }
        }
    });
});

module.exports = app;