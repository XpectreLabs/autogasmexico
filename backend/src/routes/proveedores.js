
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/proveedores.js');
const fnUsuatio = require('../services/users.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();
  console.log(date);
  await prisma.proveedores.create({
    data: {
      name: req.body.name,
      rfc: req.body.rfc,
      direccion: req.body.direccion?req.body.direccion:null,
      tipo_situacion_fiscal: req.body.tipo_situacion_fiscal,
      phone: req.body.phone?req.body.phone:null,
      email: req.body.email?req.body.email:null,
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });
  res.status(200).json({ message:"success" });
});

router.get('/:userId/proveedores',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listProveedores = await prisma.proveedores.findMany({
        orderBy: [
          {
            date: 'desc',
          },
        ],
        where: {
          user_id: parseInt(id),
          active: 1,
        },
        select: {
          proveedor_id: true,
          name: true,
          rfc: true,
          direccion: true,
          tipo_situacion_fiscal: true,
          phone: true,
          email: true,
          date: true,
        },
      });
      res.status(200).json({ message:"success", listProveedores });
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

  const id = parseInt(req.body.proveedor_id);

  await prisma.proveedores.update({
    where: {
      proveedor_id: parseInt(id),
    },
    data: {
      name: req.body.name,
      rfc: req.body.rfc,
      direccion: req.body.direccion?req.body.direccion:null,
      tipo_situacion_fiscal: req.body.tipo_situacion_fiscal,
      phone: req.body.phone?req.body.phone:null,
      email: req.body.email?req.body.email:null,
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdProveedor.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.proveedor_id);
  await prisma.proveedores.update({
    where: {
      proveedor_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({ message:"success"});
});

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

module.exports = router;