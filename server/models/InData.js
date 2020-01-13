/**
 *
 * @title:             IN model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose Database model for incoming contacts
 *
 **/


const mongoose = require('mongoose');

// ===============================================
// Incoming contact Schema
// ===============================================
let Schema = mongoose.Schema;
let INData = new Schema({
    client: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Client is required']
    },
    via: {
        type: String,
        required: false
    },
    reason: {
        type: String,
        required: false
    },
    nights: {
        type: Number,
        required: false
    },
    coments: {
        type: String,
        required: false
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is required']
    }
});

module.exports = mongoose.model('in_data', INData);