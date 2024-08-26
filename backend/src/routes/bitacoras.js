
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/bitacoras.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();
  console.log("Data");
  console.log(req.body);

  await prisma.bitacoras_inventario.create({
    data: {
      ...req.body,
      fecha_reporte: new Date(req.body.fecha_reporte),
      permiso_id: parseInt(req.body.permiso_id),
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });
  res.status(200).json({ message:"success" });
});

/*router.get('/:userId/reportes',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listReportes = await prisma.reportes.findMany({
        where: {
          user_id: parseInt(id),
          active: 1,
        },
      });
      res.status(200).json({ message:"success", listReportes });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});*/

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  await prisma.bitacoras_inventario.update({
    where: {
      bitacora_inventario_id: parseInt(req.body.bitacora_inventario_id),
    },
    data: {
      ...req.body,
    },
  });

  res.status(200).json({ message:"success" });
});

/*
router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdReporte.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.reporte_id);
  await prisma.reportes.update({
    where: {
      reporte_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({message:"success"});
});*/


/*async function validateUser(user_id) {
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
}*/


/*async function listRecepciones(user_id,fechaInicio, fechaFin) {
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

  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listIngresos = await prisma.ventas.findMany({
    where: {
      user_id,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range
      }
    },
    select: {
      venta_id: true,
      client_id: true,
      fecha_emision: true,
      cantidad: true,
      preciounitario: true,
      importe: true,
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
      ]}
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

  return Recepciones;
}



async function listEntregas(user_id,fechaInicio, fechaFin) {
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

  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listCompras = await prisma.abastecimientos.findMany({
    where: {
      user_id,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      abastecimiento_id: true,
      proveedor_id: true,
      fecha_emision: true,
      cantidad: true,
      preciounitario: true,
      importe: true,
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

  return Entregas;
}*/

module.exports = router;