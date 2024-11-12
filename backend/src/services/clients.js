const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findClient = async (rfc) =>  {
  const clientes = await prisma.clients.findFirst({
    where: {
      rfc,
    },
    select: {
      client_id: true,
    },
  });

  //console.log("Resultadoclientes".clientes);

  if (clientes === null) return 0;

  return clientes.client_id;
}

module.exports = { findClient }