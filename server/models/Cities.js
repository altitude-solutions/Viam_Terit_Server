/**
 *
 * @title:             Cities model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Cities in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// City mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let Cities = new Schema({
    city: {
        type: String,
        required: [true, 'City is required'],
        unique: true
    }
});


module.exports = mongoose.model('city', Cities);