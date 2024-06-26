const express = require('express');
const router = express();
const https = require('https');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const usuariosRoutes = require('./src/routes/users');
const proveedoresRoutes = require('./src/routes/proveedores');
const clientesRoutes = require('./src/routes/clientes');
const comprasRoutes = require('./src/routes/compras');
const ingresosRoutes = require('./src/routes/ingresos');
const reportesRoutes = require('./src/routes/reportes');

router.use(express.static('public'));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(cors());

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/usuarios', usuariosRoutes);
router.use('/api/v1/proveedores', proveedoresRoutes);
router.use('/api/v1/clientes', clientesRoutes);
router.use('/api/v1/compras', comprasRoutes);
router.use('/api/v1/ingresos', ingresosRoutes);
router.use('/api/v1/reportes', reportesRoutes);

router.listen(3001, () => {
  console.log('Aplicación ejecutandose ....');
});


// Servidor HTTP
// const httpsServer = https.createServer(options, router);
// httpsServer.listen(443, process.env.IP);