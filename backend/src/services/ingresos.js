const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fnCompras = require('./compras');
const fnClientes = require('./clients');

const findCfdiI = async (cfdi) =>  {
  //console.log("Cfdi",cfdi);
  const ventas = await prisma.ventas.findFirst({
    where: {
      cfdi,
      active: 1
    },
    select: {
      venta_id: true,
    },
  });

  //console.log("Ventas",ventas)
  if (ventas == null) return false;

  return true;
}



const guardarDataJson = async (dataJson,user_id) => {
  const rfc = dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc;
  const UsoCFDI = dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].UsoCFDI;

  let isSave =  true;
  //console.log("UsoCFDI",UsoCFDI);
  //console.log(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']);

  //S01 CP01
  //if(UsoCFDI!=="S01"&&UsoCFDI!=="G03")
    //isSave=false;

  /*if(UsoCFDI!=="S01")
  {
    const descripcion = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion;
    isSave = descripcion.indexOf("Nota de crédito")>-1;
  } */

  if(rfc==='AME050309Q32')
    return 2;
  else {
      //if(UsoCFDI==="G03"&&descripcion.indexOf("Nota de crédito")>-1) 
      if(isSave) 
      {
        let client_id = await fnClientes.findClient(rfc);
        let date = new Date().toISOString();

        console.log("rfc",rfc);
        console.log("ID",client_id)
 
        if(client_id===0) {
          console.log("Resultado",dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes']);
          const nuevo = await prisma.clients.create({
            data: {
              name: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Nombre,
              rfc: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc,
              //direccion: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor,
              direccion: "Sin registrar",
              tipo_situacion_fiscal: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor?dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor:"No tenia dirección",
              phone: null,
              email: null,
              user_id: parseInt(user_id),
              date: date,
              active: 1,
            },
          });
          console.log("Nuevo cliente",nuevo);
          client_id = nuevo.client_id;
        }

        const isArray = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length?true:false;
        let canCantidadVm = 0, preciounitarioVm = 0, importeVm = 0, ivaaplicadoVm = 0, precioventaVm = 0;
        let descripcionVm = "";
        let permisoVm = "";

        if(isArray) {
          const totalFilas = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length;

          for(let j=0; j<totalFilas; j++)
          {
            const base = parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Base);
            const iva = parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe);

            canCantidadVm += parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Cantidad);
            descripcionVm = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Descripcion;
            preciounitarioVm += parseFloat(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].ValorUnitario);
            importeVm += base;
            ivaaplicadoVm += iva;
            precioventaVm += parseFloat(base + iva);

            if(j===0){
              permisoVm = fnCompras.getPermiso(descripcionVm);

              if(permisoVm==="")
              {
                let NoIdentificacion=dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].NoIdentificacion?dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].NoIdentificacion:"";
                permisoVm = fnCompras.getPermiso(NoIdentificacion);
              }
            }
          }
          preciounitarioVm/=totalFilas;

          preciounitarioVm = Number.parseFloat(preciounitarioVm).toFixed(2);
          importeVm = Number.parseFloat(importeVm).toFixed(2);
          ivaaplicadoVm = Number.parseFloat(ivaaplicadoVm).toFixed(2);
          precioventaVm = Number.parseFloat(precioventaVm).toFixed(2);
        }

        const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
        let concepto = isArray?descripcionVm:dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

        
        let guardar=true;
        if(!isArray)
          //if(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion.indexOf("Nota de crédito")>-1||dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ClaveProdServ!=="15111510")
          if(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion.toUpperCase().indexOf("NOTA DE CRÉDITO")>-1||dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion.toUpperCase().indexOf("PAGO")>-1||parseInt(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad)===1)
            guardar=false;
          
        /*if(!isArray)
          console.log(dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ClaveProdServ)
        else
          console.log("prueba",rfc)*/

        if(guardar) {
          let permiso_id= null;
          let permiso = isArray?permisoVm:fnCompras.getPermiso(concepto);

          if(permiso===""&&!isArray)
          {
            let NoIdentificacion=dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion?dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion:"";
            permiso = fnCompras.getPermiso(NoIdentificacion);

            console.log("NoIdentificacion",NoIdentificacion);
          }

          if(permiso!=="") {
            permiso+"".trim();
            const catPermisos = await prisma.cat_permisos.findFirst({
              where: {
                permiso
              },
              select: {
                permiso_id: true,
              },
            });

            if (catPermisos !== null)
              permiso_id = catPermisos.permiso_id;
          }

          const dataR = {
            client_id,
            folio: dataJson['cfdi:Comprobante']['_attributes'].Folio,
            fecha_emision: fecha,
            cantidad: parseFloat(isArray?canCantidadVm:dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
            unidaddemedida: 'UM03',
            concepto,
            permiso_id,
            preciounitario: parseFloat(isArray?preciounitarioVm:dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
            importe: parseFloat(isArray?importeVm:dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosBaseIVA16:dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
            ivaaplicado: parseFloat(isArray?ivaaplicadoVm:dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosImpuestoIVA16:dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe),
            preciovent: parseFloat(isArray?precioventaVm:dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].MontoTotalPagos:dataJson['cfdi:Comprobante']['_attributes'].Total),
            cfdi: dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
            tipoCfdi: 'Ingreso',
            aclaracion: 'SIN OBSERVACIONES',
            tipocomplemento: 'Comercializacion',
            tipo_modena_id: 1
          }

          //console.log(dataR);

          if(!(await findCfdiI(dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
            const nV = await prisma.ventas.create({
              data: {
                ...dataR,
                client_id:parseInt(client_id),
                user_id: parseInt(user_id),
                date: date,
                active: 1,
              },
            });

            return 1;
          }
          else
            return 0
      }
    }
  }
}

module.exports = { findCfdiI,guardarDataJson }