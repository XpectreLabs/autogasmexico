const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const findProveedor = async (rfc) =>  {    
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


const getDensidad = (texto) => {
    let dens = ".";
    if(texto.includes("Den.")) {
        const posicion = texto.indexOf("Den.")+4;
                
        for(let j=posicion; j<texto.length; j++) {
            if(Number.isInteger(parseInt(texto[j])))
                dens+=texto[j];
            else
                break;
        }
    }
    else if(texto.includes("Densidad")) {
        const posicion = texto.indexOf("Densidad")+9;
              
        for(let j=posicion; j<texto.length; j++) {
            if(Number.isInteger(parseInt(texto[j]))||texto[j]==='.')
                dens+=texto[j];
            else
                break;
        }
    }
    return dens;
}

module.exports = { getDensidad }