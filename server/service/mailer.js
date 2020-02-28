/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/


// ===============================================
// import models
// ===============================================
const User = require('../models/User');
const Client = require('../models/Clients');
const RegionalClient = require('../models/RegionalClient');
const Contact = require('../models/Contacts');
const City = require('../models/Cities');
const Category = require('../models/Categories');


// ===============================================
// import modules
// ===============================================
const mailjet = require('node-mailjet').connect('671bb15f9e520627a4fd881634b04521', '6d0d43be1ac75d926b5dc70cc6401ccf')
const schedule = require('node-schedule');

let timeZoneOffset = process.env.TIME_ZONE_OFFSET || 0;

// run every monday 
let j = schedule.scheduleJob('* * * * * 1', function () {
// let j = schedule.scheduleJob('0 * * * * *', function () {
    let today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), -timeZoneOffset, 0, 0, 0).getTime();
    let oneWeeksMore = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7, -timeZoneOffset, 0, 0, 0).getTime();
    let twoWeeksMore = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 14, -timeZoneOffset, 0, 0, 0).getTime();


    User.find((err, users) => {
        let targets = [];
        users.forEach(element => {
            if (element.toJSON().email != undefined) {
                targets.push({
                    "Email": element.toJSON().email,
                    "Name": element.toJSON().realName
                });
            }
        });

        Client.find({ status: true }, 'name regionals')
            .populate('regionals', 'city category contacts salesAgent anniversary', RegionalClient, {
                status: true
            }, {
                populate: [{
                    path: 'contacts',
                    select: 'name birthday',
                    model: Contact,
                    match: {
                        status: true
                    }
                }, {
                    path: 'city',
                    select: 'city',
                    model: City
                }, {
                    path: 'category',
                    select: 'category',
                    model: Category
                }, {
                    path: 'salesAgent',
                    select: 'realName',
                    model: User
                }]
            })
            .exec((err, clients) => {
                if (err) {
                    console.log(err);
                } else {
                    let aux_client = [];
                    clients.forEach(element => {
                        let aux_regi = [];

                        element.regionals.forEach(element_reg => {
                            if (element_reg.anniversary != undefined) {
                                let current_element_anniversary = new Date(new Date(today).getFullYear(), new Date(element_reg.anniversary).getMonth(), new Date(element_reg.anniversary).getDate()).getTime();
                                if (current_element_anniversary >= today && current_element_anniversary <= twoWeeksMore) {
                                    aux_regi.push({
                                        anniversary: new Date(current_element_anniversary),
                                        city: element_reg.city.city
                                    });
                                }
                            }
                        });

                        if (aux_regi.length > 0) {
                            aux_client.push({
                                name: element.name,
                                regionals: aux_regi
                            });
                        }
                    });

                    Contact.find({
                        status: true
                    }, (err, contacts) => {
                        if (err) {
                            console.log(err);
                        } else {
                            let aux_contacts = [];
                            contacts.forEach(contact_element => {
                                if (contact_element.birthday != undefined) {
                                    let current_element_birthday = new Date(new Date(today).getFullYear(), new Date(contact_element.birthday).getMonth(), new Date(contact_element.birthday).getDate()).getTime();
                                    if (current_element_birthday >= today && current_element_birthday <= twoWeeksMore) {
                                        aux_contacts.push({
                                            name: contact_element.name,
                                            birthday: new Date(current_element_birthday)
                                        });
                                    }
                                }
                            });
                            let mailBody = '';
                            mailBody += `<h2>`;
                            mailBody += `    Esta semana`;
                            mailBody += `</h2>`;
                            mailBody += `<ul>`;
                            mailBody += `    <h3>Aniversarios</h3>`;
                            aux_client.forEach(client_ann => { 
                                client_ann.regionals.forEach(current_reg_ann => {
                                    if(current_reg_ann.anniversary.getTime() < oneWeeksMore ) {
                                        mailBody += `    <li>`;
                                        mailBody += `        ${client_ann.name} en ${current_reg_ann.city} - ${current_reg_ann.anniversary.getDate()}/${current_reg_ann.anniversary.getMonth()+1}/${current_reg_ann.getFullYear()}`;
                                        mailBody += `    </li>`;
                                    }
                                });
                            });
                            mailBody += `    <h3>Cumpleaños</h3>`;
                            aux_contacts.forEach(contact_birth => {
                                if(contact_birth.birthday.getTime() < oneWeeksMore){
                                    mailBody += `    <li>`;
                                    mailBody += `        ${contact_birth.name} - ${contact_birth.birthday.getDate()}/${contact_birth.birthday.getMonth()+1}/${contact_birth.birthday.getFullYear()}`;
                                    mailBody += `    </li>`;
                                }
                            });
                            mailBody += `</ul>`;
                            mailBody += `<h2>`;
                            mailBody += `    Próxima semana`;
                            mailBody += `</h2>`;
                            mailBody += `<ul>`;
                            mailBody += `    <h3>Aniversarios</h3>`;
                            aux_client.forEach(client_ann => { 
                                client_ann.regionals.forEach(current_reg_ann => {
                                    if(current_reg_ann.anniversary.getTime() >= oneWeeksMore ) {
                                        mailBody += `    <li>`;
                                        mailBody += `        ${client_ann.name} en ${current_reg_ann.city} - ${current_reg_ann.anniversary.getDate()}/${current_reg_ann.anniversary.getMonth()+1}/${current_reg_ann.anniversary.getFullYear()}`;
                                        mailBody += `    </li>`;
                                    }
                                });
                            });
                            mailBody += `    <h3>Cumpleaños</h3>`;
                            aux_contacts.forEach(contact_birth => {
                                if(contact_birth.birthday.getTime() >= oneWeeksMore){
                                    mailBody += `    <li>`;
                                    mailBody += `        ${contact_birth.name} - ${contact_birth.birthday.getDate()}/${contact_birth.birthday.getMonth()+1}/${contact_birth.birthday.getFullYear()}`;
                                    mailBody += `    </li>`;
                                }
                            });
                            mailBody += `</ul>`;

                            let request = mailjet
                                .post("send", { 'version': 'v3.1' })
                                .request({
                                    "Messages": [
                                        {
                                            "From": {
                                                "Email": "camino.real.clients.app@gmail.com",
                                                "Name": "Camino Real"
                                            },
                                            "To": targets,
                                            "Subject": "Cumpleaños y aniversarios",
                                            "TextPart": '',
                                            "HTMLPart": mailBody,
                                            "CustomID": "ClientesCorporativos"
                                        }
                                    ]
                                });
                            request
                                .then((result) => {
                                    // console.log(result.body);
                                })
                                .catch((err) => {
                                    console.log(err.statusCode);
                                });
                        }
                    });
                }
            });
    });
});
