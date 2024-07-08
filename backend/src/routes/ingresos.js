
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/ingresos.js');
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');
router.use(fileUpload());
const fnClientes = require('../services/clients');

router.post('/',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

  await prisma.ventas.create({
    data: {
      ...req.body,
      client_id:parseInt(req.body.client_id),
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });
  res.status(200).json({ message:"success" });
});

router.get('/:userId/ingresos',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listIngresos = await prisma.ventas.findMany({
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
          venta_id: true,
          client_id: true,
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
          clients: {
            select: {
              name: true
            },
          },
        },
      });
      res.status(200).json({ message:"success", listIngresos });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});

router.get('/:userId/list', async (req, res, next) => {

  let Recepciones = {
    "TotalRecepcionesMes": 0,
    "SumaVolumenRecepcionMes": {
      "ValorNumerico": 0,
      "UnidadDeMedida": "UM03"
    },
    "TotalDocumentosMes": 0,
    "ImporteTotalRecepcionesMensual": 15274877.89,
    "Complemento":[]
  }


  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {

      const listIngresos = await prisma.ventas.findMany({
        where: {
          user_id: 1,
          active: 1,
          fecha_emision: {
            gte: new Date(req.body.fechaInicio), // Start of date range
			      lte: new Date(req.body.fechaFin), // End of date range
          }
        },
        select: {
          venta_id: true,
          client_id: true,
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
          clients: {
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

      for(let j=0; j<listIngresos.length; j++){
        totalCantidad+=listIngresos[j].cantidad;
        totalImporteTotal+=listIngresos[j].preciovent;

        let item = {
          "TipoComplemento": listIngresos[j].tipocomplemento,
          "Nacional": [
            {
              "RfcClienteOProveedor": listIngresos[j].clients.rfc,
              "NombreClienteOProveedor": listIngresos[j].clients.name,
              "PermisoClienteOProveedor": listIngresos[j].clients.permiso,
              "CFDIs": [
                {
                  "Cfdi": listIngresos[j].cfdi,
                  "TipoCfdi": listIngresos[j].tipoCfdi,
                  "PrecioVentaOCompraOContrap": listIngresos[j].preciovent,
                  "FechaYHoraTransaccion": listIngresos[j].fecha_emision,
                  "VolumenDocumentado": {
                    "ValorNumerico": listIngresos[j].cantidad,
                    "UnidadDeMedida": listIngresos[j].unidaddemedida
                  }
                }
              ]
            }
          ],
          "Aclaracion": listIngresos[j].aclaracion
        };

        Complemento.push(item);
      }

      Recepciones.TotalRecepcionesMes = listIngresos.length;
      Recepciones.TotalDocumentosMes = listIngresos.length;
      Recepciones.SumaVolumenRecepcionMes.ValorNumerico = totalCantidad;
      Recepciones.ImporteTotalRecepcionesMensual = totalImporteTotal;
      Recepciones.Complemento = Complemento;

      res.status(200).json({ message:"success", Recepciones });
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

            const rfc = dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de ventas' });
            else {
              let client_id = await fnClientes.findClient(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",client_id)

              if(client_id===0) {
                const nuevo = await prisma.clients.create({
                  data: {
                    name: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Nombre,
                    rfc: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc,
                    direccion: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor,
                    tipo_situacion_fiscal: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor,
                    permiso: null,
                    phone: null,
                    email: null,
                    user_id: parseInt(req.body.user_id),
                    date: date,
                    active: 1,
                  },
                });
                console.log("Nuevo cliente",nuevo);
                client_id = nuevo.client_id;
              }

              const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
              const concepto = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion
              const dataR = {
                client_id,
                folio: dataJson['cfdi:Comprobante']['_attributes'].Folio,
                fecha_emision: fecha,
                cantidad: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
                unidaddemedida: 'UM03',
                concepto,
                preciounitario: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
                importe: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosBaseIVA16:dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
                ivaaplicado: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosImpuestoIVA16:dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe),
                preciovent: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].MontoTotalPagos:dataJson['cfdi:Comprobante']['_attributes'].Total),
                cfdi: dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
                tipoCfdi: 'Ingreso',
                aclaracion: 'SIN OBSERVACIONES',
                tipocomplemento: 'Comercializacion',
                tipo_modena_id: 1
              }

              console.log(dataR);

              const nV = await prisma.ventas.create({
                data: {
                  ...dataR,
                  client_id:parseInt(client_id),
                  user_id: parseInt(req.body.user_id),
                  date: date,
                  active: 1,
                },
              });

              console.log(nV);
            return res.status(200).send({ message : 'success',dataJson })
          }
        })
    })
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.venta_id);

  await prisma.ventas.update({
    where: {
      venta_id: parseInt(id),
    },
    data: {
      ...req.body,
      client_id:parseInt(req.body.client_id),
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdVenta.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.venta_id);
  await prisma.ventas.update({
    where: {
      venta_id: parseInt(id),
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