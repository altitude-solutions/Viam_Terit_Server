/**
 *
 * @title:             Contact model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Contacts in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// Contact mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let ContactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del contacto es necesario']
    },
    job: {
        type: String,
        required: false
    },
    phoneNumbers: {
        type: [String],
        default: []
    },
    emailAddresses: {
        type: [String],
        default: []
    },
    primary: {
        type: Boolean,
        required: true,
        default: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('contact', ContactSchema);