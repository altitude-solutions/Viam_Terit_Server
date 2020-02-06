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
    earlyCheckIn: {
        type: Number,
        required: [true, 'La cantidad de Early Check-In es necesaria'],
        default: 0
    },
    lateCheckOut: {
        type: Number,
        required: [true, 'La cantidad de Late Check-Out es necesaria'],
        default: 0
    },
    upgrade: {
        type: Number,
        required: [true, 'La cantidad de Upgrade es necesaria'],
        default: 0
    },
    noShow: {
        type: Number,
        required: [true, 'La cantidad de Early No Show es necesaria'],
        default: 0
    },
    // givenBenefits: {
    //     type: [mongoose.Types.ObjectId],
    //     required: false
    // },
    // ===============================================
    // PdV
    // ===============================================
    restaurant: {
        type: String
    },
    events: {
        type: String
    },
    other: {
        type: String
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El usuario es necesario']
    }
});

module.exports = mongoose.model('in_data', INData);