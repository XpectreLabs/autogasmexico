const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fn = require('../services/users.js');
const sch = require('../schemas/auth.js');
const fnPermiso = require("../services/permisos.js")

router.post('/login', async (req, res, next) => {
  const { error } = sch.schema.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(403).json({ message:"schema", error: error.details[0].message });
  }

  try {
    const password = fn.getPasswordEncrypted(req.body.password)
    let user = await fn.findUser(req.body.username, password);

    console.log("Password"+req.body.username, password)

    console.log("user",user,(user > 0))
    if (user !== 0) {
      const token = generateAccessToken(jwt, user);
      const isInicial = await fnPermiso.findNamePermiso(3)?true:false;
      res.status(200).json({ message:"success", user_id: user.user_id, name: (user.firstname + " " + user.lastname), rfccontribuyente: user.rfccontribuyente, rfcproveedor: user.rfcproveedor, rfcrepresentantelegal:user.rfcrepresentantelegal, type_user: user.type_user, token, isInicial });
    } else {
      let messageError = 'Los datos de acceso son incorrectos';
      console.log(messageError);

      res.status(400).json({ message: messageError });
    }
  } catch (e) {
    let messageError = 'Los datos de acceso son incorrectos';
    console.log(messageError);
    res.status(400).json({ message: messageError });
  }
});

function generateAccessToken(user) {
  return jwt.sign({ user }, process.env.SECRET, { expiresIn: 60 * 60 * 24 });
}

router.post('/changePassword', async (req, res, next) => {
  const id = parseInt(req.body.user_id);
  await prisma.users.update({
    where: {
      user_id: parseInt(id),
    },
    data: {
      password: req.body.password,
    },
  });
  res.json({ status: 'success' });
});

module.exports = router;