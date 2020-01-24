/**
 *
 * @title:             Benefits model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Benefits in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// Benefit mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let Benefits = new Schema({
    benefit: {
        type: String,
        required: [true, 'El Beneficio es necesario'],
        unique: true
    }
});


module.exports = mongoose.model('benefit', Benefits);