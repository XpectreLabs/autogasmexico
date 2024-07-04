const express = require('express');
const router = express();
const https = require('https');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');


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
router.use(fileUpload())

router.post('/cargarXML', (req, res, next) => {
  console.log("Ja");
  console.log(req.files);

  let EDFile = req.files.file
    EDFile.mv(`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

        let dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
        console.log(dataJson);

        return res.status(200).send({ message : 'success',dataJson })
    })
});


router.get('/traerDatosXML', (req, res, next) => {

  let result1 = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/M_177174_7d1c8379-85a8-9054-198c-665fdf8c17d4.xml', 'utf8')), {compact: true, spaces: 4}));

  /*const xmlFile = fs.readFileSync('./xmls/M_177174_7d1c8379-85a8-9054-198c-665fdf8c17d4.xml', 'utf8');
  result1 = xmlJs.xml2json(xmlFile, {compact: true, spaces: 4});
  result1 = JSON.parse(result1);
  console.log(result1);*/
  console.log(result1);
  return res.status(200).send({ message : 'File upload', result1 });
});

router.listen(3001, () => {
  console.log('Aplicación ejecutandose ....');
});


// Servidor HTTP
// const httpsServer = https.createServer(options, router);
// httpsServer.listen(443, process.env.IP);