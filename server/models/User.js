/**
 *
 * @title:             User model
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Mongoose database model for Users in MongoDB
 *
 **/


const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// ============================
// User mongoose Schema
// ============================
let Schema = mongoose.Schema;
let userScheme = new Schema({
    realName: {
        type: String,
        required: [true, 'Real name is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        unique: true
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: [true, 'Password is mandatory']
    },
    img: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        required: false,
        default: true
    }
});

userScheme.plugin(uniqueValidator, {
    message: '{PATH} must be unique'
});

// ============================
// Exclude password of the requested user
// ============================
userScheme.methods.toJSON = function() {
    let usuar = this;
    let userObj = usuar.toObject();
    delete userObj.password;

    return userObj;
}


module.exports = mongoose.model('user', userScheme);