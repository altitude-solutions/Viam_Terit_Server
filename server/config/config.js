/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

// ===============================================
// Port
// ===============================================
process.env.PORT = process.env.PORT || 3000;

// ===============================================
// Environment
// ===============================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===============================================
// Token
// ===============================================
// process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '1h'; // one hour
process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '168h'; // one week
// process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '24h';

// ===============================================
// Token seed
// ===============================================
process.env.SEED = process.env.SEED || 'development-seed';

// ===============================================
// Database connection
// ===============================================
const mongoose = require('mongoose');

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://127.0.0.1:27017/camino_real';
} else {
    urlDB = process.env.MONGOURI;
}


process.env.URLDB = urlDB;

mongoose.connect(process.env.URLDB, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    },
    (err) => {
        if (err) {
            console.log('Error de conexión con la base de datos');
            throw err;
        } else {
            console.log('Database\t\t\tONLINE');
        }
    });