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
        type: mongoose.Types.ObjectId,
        required: [true, 'La ciudad es necesaria']
    },
    category: {
        type: mongoose.Types.ObjectId,
        required: false
    },
    contacts: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    salesAgent: {
        type: mongoose.Types.ObjectId
    },
    socialNetwork: {
        type: String
    },
    anniversary: {
        type: Number
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
});


module.exports = mongoose.model('regional_client', RegionalClientSchema);