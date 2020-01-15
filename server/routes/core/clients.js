/**
 *
 * @title:             Clients CRUD
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       CRUD requests
 *
 **/

// ===============================================
// Database model
// ===============================================
const Client = require('../../models/Clients');
const RegionalClient = require('../../models/RegionalClient');
const Contact = require('../../models/Contacts');
const User = require('../../models/User');

// ===============================================
// External imports
// ===============================================
const express = require('express');
const app = express();
const _ = require('underscore');
const xlsx = require('xlsx');
const fileUpload = require('express-fileupload');

// ===============================================
// Node modules
// ===============================================
const path = require('path');
const fs = require('fs');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');
app.use(fileUpload());


const errorMessages = {
    notFound: 'El cliente no existe'
}

app.post('/clients', [verifyToken], (req, res) => {
    let body = _.pick(req.body, ['name', 'regionals']);
    let client = new Client(body);
    client.save({}, (err, clientDB) => {
        if (err) {
            res.status(500).json({
                err
            });
        } else {
            res.json({
                client: clientDB
            });
        }
    });
});

app.get('/clients/:id', [verifyToken], (req, res) => {
    let id = req.params.id;
    Client.findById(id)
        .populate('regional_clients', 'city category contacts salesAgent', RegionalClient, {
            status: true
        }, {
            populate: {
                path: 'contacts',
                select: 'name job phoneNumbers emailAddresses',
                model: Contact,
                match: {
                    status: true
                }
            }
        })
        //.populate('contacts', 'name job phoneNubers emailAddresses', Contact, { status: true }, )
        .exec((err, client) => {
            if (err) {
                res.status(500).json({
                    err
                });
            } else {
                if (!client) {
                    res.status(404).json({
                        err: {
                            message: errorMessages.notFound
                        }
                    });
                } else {
                    res.json({
                        client
                    });
                }
            }
        });
});

app.get('/clients', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    let searchParams = {};

    if (req.query.status) {
        searchParams.status = Number(req.query.status) === 0 ? false : true;
    }
    Client.find(searchParams, 'name regionals')
        .skip(offset)
        .limit(limit)
        //.populate('contacts', 'code name job city phoneNumbers emailAddresses', Contact)
        .populate('regionals', 'city category contacts salesAgent', RegionalClient, {
            status: true
        }, {
            populate: [{
                path: 'contacts',
                select: 'name job phoneNumbers emailAddresses',
                model: Contact,
                match: {
                    status: true
                }
            }, {
                path: 'salesAgent',
                select: 'realName userName email',
                model: User,
                match: {
                    status: true
                }
            }]
        })
        .exec((err, clients) => {
            if (err) {
                res.status(500).json({
                    err
                })
            } else {
                res.json({
                    clients,
                    count: clients.length
                });
            }
        });
});

app.put('/clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'status', 'regionals']);
    let user = req.user;
    Client.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            res.json(500).json({
                err
            });
        } else {
            if (!updated) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                });
            } else {
                res.json({
                    client: updated
                });
            }
        }
    });
});

app.delete('/clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    Client.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, deleted) => {
        if (err) {
            res.json(500).json({
                err
            });
        } else {
            if (!deleted) {
                res.status(404).json({
                    err: {
                        message: errorMessages.notFound
                    }
                })
            } else {
                res.json({
                    client: deleted
                });
            }
        }
    });
});

app.post('/regional_clients', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['city', 'category', 'contacts', 'salesAgent']);

    let regionalClient = new RegionalClient(body);
    regionalClient.save((err, saved) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        res.json({
            regional_client: saved
        });
    });
});

app.get('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    RegionalClient.findById(id)
        .populate('contacts', 'name job phoneNumbers emailAddresses', Contact, {
            status: true
        })
        .populate('salesAgent', 'realName userName email', User, {
            status: true
        })
        .exec((err, regional_client) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }

            res.json({
                regional_client
            });
        });
});

app.get('/regional_clients', verifyToken, (req, res) => {
    let offset = req.query.from || 0;
    let limit = req.query.to || 1000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.status = status === 0 ? false : true;
    }


    RegionalClient.find(where, 'city category contacts salesAgent')
        .skip(offset)
        .limit(limit)
        .populate('contacts', 'name job phoneNumbers emailAddresses', Contact, {
            status: true
        })
        .populate('salesAgent', 'realName userName email', User, {
            status: true
        })
        .exec((err, regional_clients) => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }

            res.json({
                regional_clients,
                count: regional_clients.length
            });
        });
});

app.put('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['city', 'category', 'contacts', 'salesAgent', 'status']);

    RegionalClient.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        res.json({
            regional_client: updated
        });
    });
});

app.delete('/regional_clients/:id', verifyToken, (req, res) => {
    let id = req.params.id;

    RegionalClient.findByIdAndUpdate(id, { status: false }, { new: true, runValidators: true, context: 'query' }, (err, updated) => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        res.json({
            regional_client: updated
        });
    });
});

app.post('/upload/clients', verifyToken, (req, res) => {
    // let body = req.body;
    let user = req.user;
    if (req.files) {
        let extentions = ['xlsx', 'xls'];
        let file = req.files.file;

        let fileName = file.name.split('.');
        let extention = fileName[fileName.length - 1];
        if (extentions.indexOf(extention) < 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas son: ' + extentions.join(', ') + `. La extensión encontrada es ${extention}`
                }
            });
        }

        let nameForNewFile = new Date().getTime() + `-${user._id}.${extention}`;
        file.mv(`uploads/${nameForNewFile}`, (err) => {
            if (err) {
                return res.status(500), json({
                    err: {
                        message: 'Error cargando la lista de clientes'
                    }
                });
            }

            let workbook = xlsx.readFile(`uploads/${nameForNewFile}`);

            let clientsData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[workbook.SheetNames.indexOf('Clientes')]]);
            let contactsData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[workbook.SheetNames.indexOf('Contactos')]]);

            let clientCodesArray = [];
            let contactsToBeCreatedArray = [];

            clientsData.forEach(element => {
                element.name = element['Nombre del cliente'];
                delete element['Nombre del cliente'];
                element.code = element['Código del cliente'];
                delete element['Código del cliente'];
                clientCodesArray.push(element.code);
            });

            contactsData.forEach(element => {
                element.client = element['Cliente'];
                delete element['Cliente'];
                if (element['Nombre']) {
                    element.name = element['Nombre'];
                }
                delete element['Nombre'];
                if (element['Cargo']) {
                    element.job = element['Cargo'];
                }
                delete element['Cargo'];
                if (element['Cuidad']) {
                    element.city = element['Cuidad'];
                }
                delete element['Cuidad'];

                if (element['Teléfono']) {
                    element.phoneNumber = element['Teléfono'].split(';');
                } else {
                    element.phoneNumber = [];
                }
                delete element['Teléfono'];
                if (element['email']) {
                    element.emailAddresses = element['email'].split(';');
                } else {
                    element.emailAddresses = [];
                }
                delete element['email'];
                if (clientCodesArray.includes(element.client)) {
                    contactsToBeCreatedArray.push(element);
                }
            });


            Client.create(clientsData, (err, clients) => {
                if (err) {
                    if (err.message == 'client validation failed: code: code debe ser único') {
                        return res.status(400).json({
                            err: {
                                message: 'El código debe ser único'
                            }
                        });
                    } else {
                        return res.status(500).json({
                            err
                        });
                    }
                }

                // let contactUpdater = {};

                // contactsData.forEach(contactInfo => {
                //     let aux = clients.find(searchResult => {
                //         return contactInfo.client == searchResult.code;
                //     });
                //     if (aux) {
                //         if (contactUpdater[aux._id]) {
                //             contactUpdater[aux._id].push(contactInfo);
                //         } else {
                //             contactUpdater[aux._id] = [contactInfo];
                //         }
                //     } else {
                //         console.log(contactInfo.client, 'no existe');
                //     }
                // });

                Contact.create(contactsToBeCreatedArray, (err, contacts) => {
                    if (err) {
                        return res.status(500).json({
                            err
                        });
                    }

                    let updatedFlag = false;
                    let clientContacts = [];
                    clients.forEach(auxClient => {
                        contacts.forEach(auxContact => {
                            if (auxClient.code == auxContact.client) {
                                clientContacts.push({
                                    clientID: auxClient._id,
                                    contactID: auxContact._id
                                });
                            }
                        });
                    });

                    clientContacts.forEach(auxArray => {

                    });
                    Client.findByIdAndUpdate()

                    //while(!updatedFlag);

                    res.json({
                        // clients,
                        clientCount: clients.length,
                        contactCount: contacts.length
                    });

                });
            });
        });
    } else {
        res.status(400).json({
            err: {
                message: 'No se pudo cargar el archivo'
            }
        });
    }
});


module.exports = app;