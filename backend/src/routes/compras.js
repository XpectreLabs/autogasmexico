
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/compras.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

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
      res.status(200).json({ message:"success", listCompras });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
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