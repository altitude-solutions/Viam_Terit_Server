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
const OUTData = require('../../models/outData');

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


app.post('/in_data', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['client', 'via', 'reason', 'nights', 'coments']);
    let user = req.user;
    body.user = user._id;
    let dataset = new INData(nody);

    dataset.save({}, (err, inDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            res.json({
                inData: inDB
            });
        }
    });
});

module.exports = app;