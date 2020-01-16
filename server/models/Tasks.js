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
    client: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El cliente es necesario']
    },
    regional: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El cliente regional es necesario']
    },
    todo: {
        type: String,
        required: [true, 'El pendiente es necesario']
    },
    creationAgent: {
        type: mongoose.Types.ObjectId,
        required: [true, 'El usuario es necesario']
    },
    registerDate: {
        type: Number,
        required: [true, 'La fecha es necesaria']
    },
    completed: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String
    },
    doneDate: {
        type: Number
    },
    doneAgent: {
        type: mongoose.Types.ObjectId
    }
});


module.exports = mongoose.model('task', TaskSchema);