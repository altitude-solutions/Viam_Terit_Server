/**
 *
 * @title:             Users CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/


const express = require('express');
const app = express();

app.post('/users', (req, res) => {
    let body = req.body;
    res.json({
        body
    });
});



module.exports = app;