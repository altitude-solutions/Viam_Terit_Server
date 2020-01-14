/**
 *
 * @title:             OUT model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose Database model for outgoing contacts
 *
 **/


const mongoose = require('mongoose');

// ===============================================
// Incoming contact Schema
// ===============================================
let Schema = mongoose.Schema;
let OUTData = new Schema({
    client: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El cliente es necesario']
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
    result: {
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
    competition: {
        type: String,
        required: false
    },
    budget: {
        type: String,
        required: false
    },
    estimateNights: {
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


module.exports = mongoose.model('out_data', OUTData);