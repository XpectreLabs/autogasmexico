const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto  = require('crypto');
const encryption_key = "byz9VFNtbRQM0yBODcCb1lrUtVVH3D3x"; // Must be 32 characters
const initialization_vector = "X05IGQ5qdBnIqAWD";

async function getObtenerRFCAsociados(user_id) {
  const users = await prisma.users.findFirst({
    where: {
      user_id
    },
    select: {
      rfcproveedor: true,
      rfcrepresentantelegal: true
    },
  });

  if (users == null) return 0;

  return users;
}

async function findUser(username, password) {
  const users = await prisma.users.findFirst({
    where: {
      username,
      password,
    },
    select: {
      user_id: true,
      firstname: true,
      lastname: true,
      type_user: true,
      rfccontribuyente: true,
      rfcproveedor: true,
      rfcrepresentantelegal: true
    },
  });

  if (users == null) return 0;


  if(users.type_user!==1){
    const dataUser = await getObtenerRFCAsociados(1);
    users.rfcproveedor = dataUser.rfcproveedor;
    users.rfcrepresentantelegal = dataUser.rfcrepresentantelegal;
  }


  return users;
}

function getPasswordEncrypted(password) {// Must be 16 characters
  const cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(encryption_key), Buffer.from(initialization_vector))
  let crypted = cipher.update(password, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return (crypted)
}

async function validateUser(user_id) {
  ////console.log("validateUser_> "+user_id);
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

module.exports = { findUser,getPasswordEncrypted,validateUser }