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
app.use(require('./authentication/login'));
app.use(require('./core/clients'));
app.use(require('./core/contacts'));
app.use(require('./core/registers'));



module.exports = app;