
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/clientes.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();
  console.log(date);
  await prisma.clients.create({
    data: {
      name: req.body.name,
      rfc: req.body.rfc,
      direccion: req.body.direccion,
      tipo_situacion_fiscal: req.body.tipo_situacion_fiscal,
      permiso: req.body.permiso,
      phone: req.body.phone?req.body.phone:null,
      email: req.body.email?req.body.email:null,
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });
  res.status(200).json({ message:"success" });
});

router.get('/:userId/clientes',jwtV.verifyToken, async (req, res, next) => {
  console.log("SI");
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listClientes = await prisma.clients.findMany({
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
          client_id: true,
          name: true,
          rfc: true,
          direccion: true,
          tipo_situacion_fiscal: true,
          permiso: true,
          phone: true,
          email: true,
          date: true,
        },
      });
      console.log("List",listClientes);
      res.status(200).json({ message:"success", listClientes });
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

  const id = parseInt(req.body.client_id);

  await prisma.clients.update({
    where: {
      client_id: parseInt(id),
    },
    data: {
      name: req.body.name,
      rfc: req.body.rfc,
      direccion: req.body.direccion,
      tipo_situacion_fiscal: req.body.tipo_situacion_fiscal,
      permiso: req.body.permiso,
      phone: req.body.phone?req.body.phone:null,
      email: req.body.email?req.body.email:null,
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdCliente.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.client_id);
  await prisma.clients.update({
    where: {
      client_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({ message:"success"});
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