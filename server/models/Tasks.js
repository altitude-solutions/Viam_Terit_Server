/**
 *
 * @title:             Task model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Tasks in MongoDB
 *
 **/

const mongoose = require('mongoose');


// ===============================================
// Task moongoose Schema
// ===============================================
let Schema = mongoose.Schema
let TaskSchema = new Schema({

});


module.exports = mongoose.model('task', TaskSchema);