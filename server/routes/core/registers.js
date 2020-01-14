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
    contactNotFound: 'Seleccione un cliente por favor'
}


app.post('/in_data', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['client', 'contact', 'via', 'reason', 'nights', 'comments', 'date']);
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
            res.json({
                inData: inDB
            });
        }
    });
});


app.post('/out_data', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['client', 'contact', 'via', 'reason', 'result', 'nights', 'comments', 'competition', 'budget', 'estimateNights', 'date']);
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
            res.json({
                inData: outDB
            });
        }
    });
});

module.exports = app;