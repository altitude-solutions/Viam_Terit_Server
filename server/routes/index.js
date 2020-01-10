/**
 *
 * @title:             Route index
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Route indexing
 *
 **/


const express = require('express');
const app = express();

app.use(require('./core/users'));


module.exports = app;