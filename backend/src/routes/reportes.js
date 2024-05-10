
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const reporteS = require('../services/reportes.js');
const sch = require('../schemas/reportes.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();
  const dataJson = await reporteS.generarJson(req.body,date);


  /*await prisma.reportes.create({
    data: {
      ...req.body,
      tipoevento:  parseFloat(req.body.tipoevento),
      composdepropanoengaslp: parseFloat(req.body.composdepropanoengaslp),
      composdebutanoengaslp: parseFloat(req.body.composdebutanoengaslp),
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    },
  });*/
  res.status(200).json({ message:"success", dataJson });
});

router.get('/:userId/reportes',jwtV.verifyToken, async (req, res, next) => {
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
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
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
      ...req.body,
      tipoevento:  parseFloat(req.body.tipoevento),
      composdepropanoengaslp: parseFloat(req.body.composdepropanoengaslp),
      composdebutanoengaslp: parseFloat(req.body.composdebutanoengaslp),
    },
  });
  res.status(200).json({ message:"success"});
});

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