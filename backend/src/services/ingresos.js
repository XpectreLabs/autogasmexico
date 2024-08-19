const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findCfdiI = async (cfdi) =>  {
  console.log("Cfdi",cfdi);
  const ventas = await prisma.ventas.findFirst({
    where: {
      cfdi,
    },
    select: {
      venta_id: true,
    },
  });

  console.log("Ventas",ventas)
  if (ventas == null) return false;

  return true;
}


module.exports = { findCfdiI }