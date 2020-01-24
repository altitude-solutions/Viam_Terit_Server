/**
 *
 * @title:             Categories model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Categories in MongoDB
 *
 **/


const mongoose = require('mongoose');


// ===============================================
// Category mongoose Schema
// ===============================================
let Schema = mongoose.Schema;
let Categories = new Schema({
    category: {
        type: String,
        required: [true, 'Category is required']
    }
});


module.exports = mongoose.model('category', Categories);