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
process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '168h'; // one week
// process.env.CADUCIDAD_TOKEN = process.env.CADUCIDAD_TOKEN || '24h';

// ===============================================
// Token seed
// ===============================================
process.env.SEED = process.env.SEED || 'development-seed';

// ===============================================
// Database connection
// ===============================================