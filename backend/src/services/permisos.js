const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findInventarioInicial = async (permiso_id) =>  {    
  const permisos = await prisma.cat_permisos.findFirst({
    where: {
      permiso_id,
    },
    select: {
      inventario_inicial: true,
    },
  });

  if (permisos == null) return 0;

  return permisos.inventario_inicial;
}

module.exports = { findInventarioInicial }