/**
 *
 * @title:             Client model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Clients in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// Client mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let ClientSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Client name is required']
    },
    contacts: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('client', ClientSchema);