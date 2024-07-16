
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/compras.js');
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');
const fnProveedores = require('../services/proveedores');
const fnCompras = require('../services/compras');

router.use(fileUpload())

router.post('/',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

  console.log("Data");
  console.log(req.body);
  await prisma.abastecimientos.create({
    data: {
      ...req.body,
      proveedor_id:parseInt(req.body.proveedor_id),
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });
  res.status(200).json({ message:"success" });
});

router.get('/:userId/compras',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listCompras = await prisma.abastecimientos.findMany({
        orderBy: [
          {
            fecha_emision: 'desc',
          },
        ],
        where: {
          user_id: parseInt(id),
          active: 1,
        },
        select: {
          abastecimiento_id: true,
          proveedor_id: true,
          folio: true,
          fecha_emision: true,
          cantidad: true,
          concepto: true,
          preciounitario: true,
          importe: true,
          ivaaplicado: true,
          densidad: true,
          permiso: true,
          tipo_modena_id: true,
          cfdi: true,
          tipoCfdi: true,
          preciovent: true,
          aclaracion: true,
          tipocomplemento: true,
          unidaddemedida: true,
          proveedores: {
            select: {
              name: true,
              rfc: true,
            },
          },
        },
      });
      res.status(200).json({ message:"success", listCompras });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});


router.post('/cargarXML', async (req, res, next) => {
  let dataJson;

  console.log(req.body.user_id);
  let EDFile = req.files.file;
  EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

          return new Promise(async (resolve,reject)=>{  
            dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            console.log(dataJson);
    
            const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de compras' });
            else {
              let proveedor_id = await fnProveedores.findProveedor(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",proveedor_id)

              if(proveedor_id===0) {                
                const nuevo = await prisma.proveedores.create({
                  data: {
                    name: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Nombre,
                    rfc: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc,
                    direccion: null,
                    tipo_situacion_fiscal: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].RegimenFiscal,
                    phone: null,
                    email: null,
                    user_id: parseInt(req.body.user_id),
                    date: date,
                    active: 1,
                  },
                });
                console.log("Nuevo proveedor",nuevo);
                proveedor_id = nuevo.proveedor_id;
              }

                const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
                const concepto = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

                const dens = fnCompras.getDensidad(concepto);
                const permiso = fnCompras.getPermiso(concepto);
                console.log("Rd",dens)

                const densidad = parseFloat(dens===''?0:dens);

                const dataR = {
                  proveedor_id,
                  folio: dataJson['cfdi:Comprobante']['_attributes'].Folio,
                  fecha_emision: fecha,
                  cantidad: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
                  concepto,
                  densidad,
                  permiso,
                  preciounitario: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
                  importe: parseFloat(dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
                  ivaaplicado: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Impuestos']['_attributes'].TotalImpuestosTrasladados),
                  cfdi: dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
                  tipoCfdi: 'Ingreso',
                  preciovent: parseFloat(dataJson['cfdi:Comprobante']['_attributes'].Total),
                  aclaracion: 'SIN OBSERVACIONES',
                  tipocomplemento: 'Comercializacion',
                  unidaddemedida: 'UM03',
                  tipo_modena_id: 1
                }

                await prisma.abastecimientos.create({
                  data: {
                    ...dataR,
                    proveedor_id:parseInt(proveedor_id),
                    user_id: parseInt(req.body.user_id),
                    date: date,
                    active: 1,
                  },
                });

              return res.status(200).send({ message : 'success',dataJson })
            }
        })
    })
});


router.get('/:userId/listPermisoNulosCompras/:fecha_inicio/:fecha_terminacion', async (req, res, next) => {
  const fi = (req.params.fecha_inicio+"").substring(0,10);
  const ff = (req.params.fecha_terminacion+"").substring(0,10);

  console.log("Si"+req.params.fecha_terminacion);
  const listComprasSinPermisos = await prisma.abastecimientos.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      permiso: null,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      folio: true,
    },
  });
  return res.status(200).send({ message : 'success',listComprasSinPermisos })
});


router.get('/:userId/list', async (req, res, next) => {
  let Entregas = {
    "TotalEntregasMes": 0,
    "SumaVolumenEntregadoMes": {
      "ValorNumerico": 0,
      "UnidadDeMedida": "UM03"
    },
    "TotalDocumentosMes": 0,
    "ImporteTotalEntregasMes": 15274877.89,
    "Complemento":[]
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listCompras = await prisma.abastecimientos.findMany({
        where: {
          user_id: parseInt(id),
          active: 1,
          fecha_emision: {
            gte: new Date(req.body.fechaInicio), // Start of date range
			      lte: new Date(req.body.fechaFin), // End of date range
          }
        },
        select: {
          abastecimiento_id: true,
          proveedor_id: true,
          folio: true,
          fecha_emision: true,
          cantidad: true,
          concepto: true,
          preciounitario: true,
          importe: true,
          ivaaplicado: true,
          tipo_modena_id: true,
          cfdi: true,
          tipoCfdi: true,
          preciovent: true,
          aclaracion: true,
          tipocomplemento: true,
          unidaddemedida: true,
          proveedores: {
            select: {
              name: true,
              rfc: true,
              permiso: true,
            },
          },
        },
      });

      let totalCantidad=0;
      let totalImporteTotal=0;
      let Complemento = [];

      for(let j=0; j<listCompras.length; j++){
        totalCantidad+=listCompras[j].cantidad;
        totalImporteTotal+=listCompras[j].preciovent;

        let item = {
          "TipoComplemento": listCompras[j].tipocomplemento,
          "Nacional": [
            {
              "RfcClienteOProveedor": listCompras[j].proveedores.rfc,
              "NombreClienteOProveedor": listCompras[j].proveedores.name,
              "PermisoClienteOProveedor": listCompras[j].proveedores.permiso,
              "CFDIs": [
                {
                  "Cfdi": listCompras[j].cfdi,
                  "TipoCfdi": listCompras[j].tipoCfdi,
                  "PrecioVentaOCompraOContrap": listCompras[j].preciovent,
                  "FechaYHoraTransaccion": listCompras[j].fecha_emision,
                  "VolumenDocumentado": {
                    "ValorNumerico": listCompras[j].cantidad,
                    "UnidadDeMedida": listCompras[j].unidaddemedida
                  }
                }
              ]
            }
          ],
          "Aclaracion": listCompras[j].aclaracion
        };

        Complemento.push(item);
      }

      Entregas.TotalEntregasMes = listCompras.length;
      Entregas.TotalDocumentosMes = listCompras.length;
      Entregas.SumaVolumenEntregadoMes.ValorNumerico = totalCantidad;
      Entregas.ImporteTotalEntregasMes = totalImporteTotal;
      Entregas.Complemento = Complemento;

      res.status(200).json({ message:"success", Entregas });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.abastecimiento_id);

  await prisma.abastecimientos.update({
    where: {
      abastecimiento_id: parseInt(id),
    },
    data: {
      ...req.body,
      proveedor_id:parseInt(req.body.proveedor_id),
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdAbastecimiento.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.abastecimiento_id);
  await prisma.abastecimientos.update({
    where: {
      abastecimiento_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({message:"success"});
});


async function validateUser(user_id) {
  const users = await prisma.users.findFirst({
    where: {
      user_id
    },
    select: {
      user_id: true,
    },
  });

  if (users == null) return false;

  return true;
}

module.exports = router;