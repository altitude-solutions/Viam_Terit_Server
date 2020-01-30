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

// Core apis
app.use(require('./core/users'));
app.use(require('./core/contacts'));
app.use(require('./core/clients'));

// Registers apis
app.use(require('./registers/registers'));
app.use(require('./registers/tasks'));

// Support apis
app.use(require('./support/benefits'));
app.use(require('./support/cities'));
app.use(require('./support/categories'));

// authentication api
app.use(require('./authentication/login'));

// Update delivery service
app.use(require('./app/deliverUpdates'));

module.exports = app;