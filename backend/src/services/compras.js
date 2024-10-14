const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fnProveedores = require('./proveedores');

const findCfdi = async (cfdi) =>  {
  console.log("Cfdi",cfdi);
  const abastecimientos = await prisma.abastecimientos.findFirst({
    where: {
      cfdi, 
      active: 1,
    },
    select: {
      abastecimiento_id: true,
    },
  });

  console.log("abastecimientos",abastecimientos)
  if (abastecimientos == null) return false;

  return true;
}

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


const getPermiso = (texto) => {
  let permiso = "";
    if(texto.includes("LP/")||texto.includes("H/")) {
      const posicion = texto.includes("LP/")?texto.indexOf("LP/"):texto.indexOf("H/");

      for(let j=posicion; j<texto.length; j++) {
        if(texto[j]!==','&&texto[j]!=='-')
          permiso+=texto[j];
        else
          break;
      }
    }
  return permiso;
}


const guardarDataJson = async (dataJson,user_id) => {
  //console.log(dataJson);
  const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

  if(rfc==='AME050309Q32')
    return 2;
  else {
    let proveedor_id = await fnProveedores.findProveedor(rfc);
    let date = new Date().toISOString();

    console.log("rfc",rfc);
    //console.log("ID",proveedor_id)

    if(proveedor_id===0) {
      const nuevo = await prisma.proveedores.create({
        data: {
          name: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Nombre,
          rfc: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc,
          direccion: null,
          tipo_situacion_fiscal: dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].RegimenFiscal,
          phone: null,
          email: null,
          user_id: parseInt(user_id),
          date: date,
          active: 1,
        },
      });
      console.log("Nuevo proveedor",nuevo);
      proveedor_id = nuevo.proveedor_id;
    }

      const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
      const concepto = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

      const dens = getDensidad(concepto);
      const permiso = getPermiso(concepto);
      console.log("Rd",dens)

      const densidad = parseFloat(dens===''?0:dens);

      const dataR = {
        proveedor_id,
        folio: dataJson['cfdi:Comprobante']['_attributes'].Folio,
        fecha_emision: fecha,
        cantidad: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
        concepto,
        densidad,
        permiso,
        preciounitario: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
        importe: parseFloat(dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
        ivaaplicado: parseFloat(dataJson['cfdi:Comprobante']['cfdi:Impuestos']['_attributes'].TotalImpuestosTrasladados),
        cfdi: dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
        tipoCfdi: 'Ingreso',
        preciovent: parseFloat(dataJson['cfdi:Comprobante']['_attributes'].Total),
        aclaracion: 'SIN OBSERVACIONES',
        tipocomplemento: 'Comercializacion',
        unidaddemedida: 'UM03',
        tipo_modena_id: 1
      }

      if(!(await findCfdi(dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
        await prisma.abastecimientos.create({
          data: {
            ...dataR,
            proveedor_id:parseInt(proveedor_id),
            user_id: parseInt(user_id),
            date: date,
            active: 1,
          },
        });
      }
      else
        return 0;
  }
}

module.exports = { getDensidad, getPermiso, findCfdi, guardarDataJson }