
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/cat_permisos.js');
const fnUsuatio = require('../services/users.js');


router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.permiso_id);

  await prisma.cat_permisos.update({
    where: {
      permiso_id: parseInt(id),
    },
    data: {
      ...req.body,
      //proveedor_id:parseInt(req.body.proveedor_id),
      //permiso_id:parseInt(req.body.permiso_id),
    },
  });
  res.status(200).json({ message:"success"});
});

router.get('/:userId/permisos',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listPermisos = await prisma.cat_permisos.findMany({
        orderBy: [
          {
            permiso_id: 'asc',
          },
        ]
      });
      res.status(200).json({ message:"success", listPermisos });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
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