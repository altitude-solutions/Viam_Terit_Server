/**
 *
 * @title:             Service for updating the app
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Updates delivery service
 *
 **/


// ===============================================
// External modules
// ===============================================
const express = require('express');
const app = express();
const unzipper = require('unzipper');
const fileUploader = require('express-fileupload');
app.use(fileUploader());

// ===============================================
// Node modules
// ===============================================
const fs = require('fs');
const path = require('path');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/auth');


// ===============================================
// Upload
// ===============================================
app.post('/update_delivery', verifyToken, (req, res) => {
    let savePath = path.resolve(__dirname, '../../../uploads');

    if (!req.files) {
        return res.status(400).json({
            err: {
                message: 'Por favor seleccione un archivo'
            }
        });
    }
    let package = req.files.package;

    // Evaluate extentions
    let extentions = ['zip'];
    let fileName = package.name.split('.');
    let extention = fileName[fileName.length - 1];
    if (!extentions.includes(extention)) {
        return res.status(400).json({
            err: {
                message: 'La extension permitida es: ' + extentions.join(', '),
                ext: extention
            }
        });
    }

    package.mv(path.resolve(savePath, package.name), err => {
        if (err) {
            return res.status(500).json({
                err
            });
        }

        if (req.query.arch) {
            let arch = req.query.arch;
            if (arch == 'amd64') {
                let pathTo64bits = path.resolve(__dirname, '../../../public', 'altitude-solutions', 'camino_real');

                fs.createReadStream(path.resolve(savePath, package.name))
                    .pipe(unzipper.Extract({ path: pathTo64bits }))
                    .promise()
                    .then(() => {
                        fs.unlink(path.resolve(savePath, package.name), (err) => {});
                        res.json({
                            repo: pathTo64bits + ' fue cargado con éxito'
                        });
                    })
                    .catch(err => {
                        return res.status(500).json({
                            err
                        });
                    });
            } else {
                if (arch == 'i386') {
                    let pathTo32bits = path.resolve(__dirname, '../../../public', 'altitude-solutions', 'camino_real32');
                    fs.createReadStream(path.resolve(savePath, package.name))
                        .pipe(unzipper.Extract({ path: pathTo32bits }))
                        .promise()
                        .then(() => {
                            fs.unlink(path.resolve(savePath, package.name), (err) => {});
                            res.json({
                                repo: pathTo32bits + ' fue cargado con éxito'
                            });
                        })
                        .catch(err => {
                            return res.status(500).json({
                                err
                            });
                        });
                } else {
                    return res.status(400).json({
                        err: {
                            message: `Las arquitecturas permitidas son ` + 'amd64, i386',
                            arch
                        }
                    });
                }
            }
        } else {
            return res.status(400).json({
                err: {
                    message: `Las arquitecturas permitidas son ` + 'amd64, i386'
                }
            });
        }
    });

});

module.exports = app;