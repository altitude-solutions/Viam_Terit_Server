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

const jwt = require('jsonwebtoken');


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
            req.user = decoded.user;
            next();
        }
    });
};



module.exports = {
    verifyToken
}