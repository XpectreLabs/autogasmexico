const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findProveedor = async (rfc) =>  {   
  rfc=rfc.trim(); 
  const proveedores = await prisma.proveedores.findFirst({
    where: {
      rfc,
    },
    select: {
      proveedor_id: true,
    },
  });

  if (proveedores == null) return 0;

  return proveedores.proveedor_id;
}

module.exports = { findProveedor }