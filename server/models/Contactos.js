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
        required: [true, 'Contact name is required']
    },
    job: {
        type: String,
        required: [true, 'Job position is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    phoneNumbers: {
        type: [String],
        default: []
    },
    emailAddresses: {
        type: [String],
        default: []
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('contact', ContactSchema);