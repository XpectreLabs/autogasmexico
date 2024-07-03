
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/users.js');
const fn = require('../services/users.js');
const mailer = require('../templates/signup-mail');

function generateAccessToken(user) {
  return jwt.sign({ user }, process.env.SECRET, { expiresIn: 60 * 60 * 24 });
}

router.post('/', async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();
  const password = fn.getPasswordEncrypted(req.body.password);
  await prisma.users.create({
    data: {
      username: req.body.username,
      firstname: req.body.firstName,
      lastname: req.body.lastName,
      password: password,
      email: req.body.email?req.body.email:null,
      date: date,
    },
  });
  //const token = generateAccessToken(jwt, newUser.user_id);
  res.status(200).json({ message:"success" });
  //res.status(200).json({ message:"success", user_id: newUser.user_id, token: token });
});


router.get('/:userId/usuarios',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message)
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const listaUsuarios = await prisma.users.findMany({
        where: {
          type_user: 2,
          active: 1,
        },
      });
      res.status(200).json({ message:"success", listaUsuarios });
    }
    else
      res.status(400).json({ message:"Invalid id", error: "Invalid request, id does not exist" });
  }
});

router.get('/:userId/usuario', async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message)
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await validateUser(parseInt(id))) {
      const dataUsuario = await prisma.users.findMany({
        where: {
          user_id: parseInt(id),
          active: 1,
        },
        select: {
          user_id: true,
          username: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      });
      res.status(200).json({ message:"success", dataUsuario });
    }
    else
      res.status(400).json({ message:"Invalid id", error: "Invalid request, id does not exist" });
  }
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  //console.log(req.body);
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message)
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  const id = parseInt(req.body.user_id);
  req.body.password?(req.body.password = fn.getPasswordEncrypted(req.body.password)):null;
  await prisma.users.update({
    where: {
      user_id: parseInt(id),
    },
    data: {
      ...req.body,
    },
  });
  res.status(200).json({ message:"success" });
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  //console.log(req.body);
  const { error } = sch.schemaId.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.userId);
  await prisma.users.update({
    where: {
      user_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({message:"success"});
});

router.post('/email', async (req, res, next) => {
  const { error } = sch.schemaEmail.validate(req.body);
  if (error) {
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }
  const email = req.body.email;
  const users = await prisma.users.findFirst({
    where: {
      email
    },
    select: {
      user_id: true,
    },
  });

  if (users){
    mailer.enviar_mail("098776868",email);
    res.status(200).json({ message:"success","user_id":users.user_id });
  }
  else
    res.status(400).json({ message:"The email is not registered." });
});


router.put('/changePassword', async (req, res, next) => {
  /*console.log(req.body);
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message)
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }*/

  if(req.body.recoveryCode === "098776868") {
      const password = fn.getPasswordEncrypted(req.body.password);
      console.log(password)
      console.log("u"+req.body.id_user_change)
      await prisma.users.update({
        where: {
          user_id: parseInt(req.body.id_user_change),
        },
        data: {
          password: password
        },
      });
      res.status(200).json({ message:"success" });
  }
  else {
    res.status(400).json({ message:"The verification code does not exist" });
  }
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