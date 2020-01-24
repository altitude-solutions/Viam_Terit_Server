/**
 *
 * @title:             Authentication middleware
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Determines if a user is allowed or not
 *
 **/


// ===============================================
// External imports
// ===============================================
const jwt = require('jsonwebtoken');

// ===============================================
// Databse models
// ===============================================
const User = require('../models/User');


// ===============================================
// Verify token
// ===============================================
let verifyToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                err
            });
        } else {
            User.findById(decoded.user._id, (err, userDB) => {
                if (err) {
                    res.status(403).json({
                        err
                    });
                } else {
                    if (!userDB) {
                        res.status(404).json({
                            err: {
                                message: 'Usuario no encontrado'
                            }
                        });
                    } else {
                        req.user = userDB;
                        next();
                    }
                }
            });
        }
    });
};



module.exports = {
    verifyToken
}