/**
 *
 * @title:             Regional client model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Regional clients in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// Client mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let RegionalClientSchema = new Schema({
    city: {
        type: String,
        required: [true, 'La ciudad es necesaria']
    },
    category: {
        type: String,
        required: [true, 'La categoria es necesaria']
    },
    contacts: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    salesAgent: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});


module.exports = mongoose.model('regional_client', RegionalClientSchema);