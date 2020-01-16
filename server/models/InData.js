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
        required: [true, 'El cliente es necesario']
    },
    regional: {
        type: mongoose.Types.ObjectId,
        required: [true, 'La regional del cliente es necesaria']
    },
    contact: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El contacto es necesario']
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
    comments: {
        type: String,
        required: false
    },
    date: {
        type: Number,
        required: false
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El usuario es necesario']
    }
});

module.exports = mongoose.model('in_data', INData);