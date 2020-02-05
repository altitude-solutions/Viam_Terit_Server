/**
 *
 * @title:             Given Benefits model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Given Benefits in MongoDB
 *
 **/


const mongoose = require('mongoose');

// ===============================================
// Benefit mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let GivenBenefit = new Schema({
    benefit: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El Beneficio es necesario']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad de beneficiarios es necesaria']
    },
    date: {
        type: Number,
        required: false
    }
});


module.exports = mongoose.model('given_benefit', GivenBenefit);