
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const reporteS = require('../services/reportes.js');
const sch = require('../schemas/reportes.js');
const fnUsuatio = require('../services/users.js');
const dayjs = require ("dayjs");
const { v4: uuidv4 } = require("uuid");
const fileUpload = require('express-fileupload');
const fs = require('fs');
router.use(fileUpload())

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  //console.log("fecha actual: "+new Date());
  let date = dayjs(new Date()).format('YYYY-MM-DDTHH:mm:ss[-]HH:mm');
  //console.log(new Date().toISOString(),date)
  ////console.log("Data");
  ////console.log(req.body);
  //console.log((req.body.fecha_inicio+"").slice(0,10)+" "+(req.body.fecha_terminacion+"").substring(0,10));
  const fechaI=(req.body.fecha_inicio+"").slice(0,10);
  const fechas = await reporteS.obtenerMesAnterior(fechaI);
  const totalRecepcionesMP = await reporteS.totalRecepciones(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  const totalEntregasMP = await reporteS.totalEntregas(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  const volumenexistenciasees = (totalRecepcionesMP-totalEntregasMP);

  //console.log("Data",totalRecepcionesMP,totalEntregasMP,volumenexistenciasees)

  const uuid = uuidv4();

  let nombre_archivo_json="M_"+(uuid.toUpperCase())+"_"+req.body.rfccontribuyente+"_"+req.body.rfcproveedor+"_"+(req.body.fecha_terminacion+"").substring(0,10)+"_CMN-0001_CMN_JSON"
  
  //console.log(nombre_archivo_json);
  //obtenerFecha(fechaI)
  //const listRecepcions = await listRecepciones(parseInt(req.body.user_id),req.body.fecha_inicio, req.body.fecha_terminacion);
  //const listEntregs =  await listEntregas(parseInt(req.body.user_id),req.body.fecha_inicio, req.body.fecha_terminacion);

  ////console.log(listRecepcions);
  //delete req.body.permiso_id;
  //delete req.body.user_id;
  //delete req.body.tipo_reporte_id;

  let numpermiso = req.body.numpermiso;
  delete req.body.numpermiso

  const consecutivos = await reporteS.obtenerConsecutivos();

  await prisma.reportes.create({
    data: {
      ...req.body,
      nombre_archivo_json,
      volumenexistenciasees: parseFloat(volumenexistenciasees),
      version: consecutivos.version,
      numeroregistro: consecutivos.numeroregistro,
      tipoevento:  parseFloat(req.body.tipoevento),
      composdepropanoengaslp: parseFloat(req.body.composdepropanoengaslp),
      composdebutanoengaslp: parseFloat(req.body.composdebutanoengaslp),
      permiso_id: parseInt(req.body.permiso_id),
      user_id: parseInt(req.body.user_id),
      date: date,
      active: 1,
    }, 
  });

  const dataJson = await reporteS.generarJson(req.body,date,consecutivos.version,consecutivos.numeroregistro,volumenexistenciasees,numpermiso);
  res.status(200).json({ message:"success", dataJson, "nombre_archivo":nombre_archivo_json });
});

router.get('/:userId/reportes',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listReportes = await prisma.reportes.findMany({
        orderBy: [
          {
            reporte_id: 'desc',
          },
        ],
        where: {
          user_id: parseInt(id),
          active: 1,
        },
      });
      res.status(200).json({ message:"success", listReportes });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  let nombre_archivo_json= req.body.nombre_archivo_json;
  //console.log(nombre_archivo_json);
  delete req.body.nombre_archivo_json;
  delete req.body.nombre_archivo_status;

  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }
 
  //console.log(req.body.version)
  const id = parseInt(req.body.reporte_id);
  let date = new Date().toISOString();

  let numpermiso = req.body.numpermiso;
  delete req.body.numpermiso

  //console.log("fechayhoraestamedicionmes",req.body.fechayhoraestamedicionmes)
  ////console.log("fechayhoraestamedicionmes",);

  //console.log("Edit",req.body)

  const fechaI=(req.body.fecha_inicio+"").slice(0,10);
  const fechas = await reporteS.obtenerMesAnterior(fechaI);
  const totalRecepcionesMP = await reporteS.totalRecepciones(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  const totalEntregasMP = await reporteS.totalEntregas(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  let volumenexistenciasees = (totalRecepcionesMP-totalEntregasMP);
  let num_modificaciones = (parseInt(req.body.num_modificaciones)+1)
  const version = "1."+num_modificaciones;

  await prisma.reportes.update({
    where: {
      reporte_id: parseInt(id),
    },
    data: {
      ...req.body,
      version,
      num_modificaciones,
      volumenexistenciasees: parseFloat(volumenexistenciasees),
      tipoevento:  parseFloat(req.body.tipoevento),
      composdepropanoengaslp: parseFloat(req.body.composdepropanoengaslp),
      composdebutanoengaslp: parseFloat(req.body.composdebutanoengaslp),
      permiso_id: parseInt(req.body.permiso_id),
    },
  });

  const dataJson = await reporteS.generarJson(req.body,date,version,"",volumenexistenciasees,numpermiso);
  res.status(200).json({ message:"success", dataJson, "nombre_archivo":nombre_archivo_json });
});



router.post('/descargarJSON',jwtV.verifyToken, async (req, res, next) => {
  let nombre_archivo_json= req.body.nombre_archivo_json;
  //console.log(nombre_archivo_json);
  delete req.body.nombre_archivo_json;
  delete req.body.nombre_archivo_status;

  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }
 
  //console.log(req.body.version)
  const id = parseInt(req.body.reporte_id);
  let date = req.body.date;

  let numpermiso = req.body.numpermiso;
  delete req.body.numpermiso

  //console.log("fechayhoraestamedicionmes",req.body.fechayhoraestamedicionmes)
  ////console.log("fechayhoraestamedicionmes",);

  //console.log("Edit",req.body)

  const fechaI=(req.body.fecha_inicio+"").slice(0,10);
  const fechas = await reporteS.obtenerMesAnterior(fechaI);
  const totalRecepcionesMP = await reporteS.totalRecepciones(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  const totalEntregasMP = await reporteS.totalEntregas(fechas.fechaInicio,fechas.fechaFinal,parseInt(req.body.permiso_id));
  let volumenexistenciasees = (totalRecepcionesMP-totalEntregasMP);
  let num_modificaciones = (parseInt(req.body.num_modificaciones)+1)
  const version = req.body.version;

  const dataJson = await reporteS.generarJson(req.body,date,version,"",volumenexistenciasees,numpermiso);
  res.status(200).json({ message:"success", dataJson, "nombre_archivo":nombre_archivo_json });
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdReporte.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.reporte_id);
  await prisma.reportes.update({
    where: {
      reporte_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({message:"success"});
});



router.post('/cargarPDF', async (req, res, next) => {

  //console.log(req.body.reporte_id);
  let EDFile = req.files.file;
  const name_archivo = EDFile.name;
  await EDFile.mv (`./public/pdfs//${EDFile.name}`,err => {
    if(err) return res.status(500).send({ message : err })
  
      new  Promise(async (resolve,reject)=>{
        await prisma.reportes.updateMany({
          where: {
            reporte_id: parseInt(req.body.reporte_id),
          },
          data: {
            nombre_archivo_status:name_archivo
          },
        });
      
        return res.status(200).send({ message : 'success'})
    })
  })
  

  

  /*for(let j=0;j<Object.keys(req.files.file).length;j++)
  {
      let EDFile = req.files.file[j];
  
      await EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

          return  new  Promise(async (resolve,reject)=>{
            dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            //console.log(dataJson);

            const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de compras' });
            else {
              let proveedor_id = await fnProveedores.findProveedor(rfc);
              let date = new Date().toISOString();

              //console.log("rfc",rfc);
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
                    user_id: parseInt(req.body.user_id),
                    date: date,
                    active: 1,
                  },
                });
                //console.log("Nuevo proveedor",nuevo);
                proveedor_id = nuevo.proveedor_id;
              }

                const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
                const concepto = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

                const dens = fnCompras.getDensidad(concepto);
                const permiso = fnCompras.getPermiso(concepto);
                //console.log("Rd",dens)

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

                //console.log("dataR",dataR);

                if(!(await fnCompras.findCfdi(dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
                  await prisma.abastecimientos.create({
                    data: {
                      ...dataR,
                      proveedor_id:parseInt(proveedor_id),
                      user_id: parseInt(req.body.user_id),
                      date: date,
                      active: 1,
                    },
                  });

                  banGuardado = true;
                }
                else
                  return res.status(400).json({ message:"schema", error: 'El UUDI de la compra  ya se habia registrado' });
            }
        })
        //console.log("a->")
    })
  }

  if(banGuardado) {
    return res.status(200).send({ message : 'success',dataJson })

  }*/
});

/*async function validateUser(user_id) {
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
}*/



/*async function listRecepciones(user_id,fechaInicio, fechaFin) {
  let Recepciones = {
    "TotalRecepcionesMes": 0,
    "SumaVolumenRecepcionMes": {
      "ValorNumerico": 0,
      "UnidadDeMedida": "UM03"
    },
    "TotalDocumentosMes": 0,
    "ImporteTotalRecepcionesMensual": 15274877.89,
    "Complemento":[]
  }

  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listIngresos = await prisma.ventas.findMany({
    where: {
      user_id,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range
      }
    },
    select: {
      venta_id: true,
      client_id: true,
      fecha_emision: true,
      cantidad: true,
      preciounitario: true,
      importe: true,
      tipo_modena_id: true,
      cfdi: true,
      tipoCfdi: true,
      preciovent: true,
      aclaracion: true,
      tipocomplemento: true,
      unidaddemedida: true,
      clients: {
        select: {
          name: true,
          rfc: true,
          permiso: true,
        },
       },
    },
   });

  let totalCantidad=0;
  let totalImporteTotal=0;
  let Complemento = [];

  for(let j=0; j<listIngresos.length; j++){
    totalCantidad+=listIngresos[j].cantidad;
    totalImporteTotal+=listIngresos[j].preciovent;

    let item = {
      "TipoComplemento": listIngresos[j].tipocomplemento,
      "Nacional": [
      {
        "RfcClienteOProveedor": listIngresos[j].clients.rfc,
        "NombreClienteOProveedor": listIngresos[j].clients.name,
        "PermisoClienteOProveedor": listIngresos[j].clients.permiso,
        "CFDIs": [
        {
          "Cfdi": listIngresos[j].cfdi,
          "TipoCfdi": listIngresos[j].tipoCfdi,
          "PrecioVentaOCompraOContrap": listIngresos[j].preciovent,
          "FechaYHoraTransaccion": listIngresos[j].fecha_emision,
          "VolumenDocumentado": {
            "ValorNumerico": listIngresos[j].cantidad,
            "UnidadDeMedida": listIngresos[j].unidaddemedida
          }
        }
      ]}
    ],
      "Aclaracion": listIngresos[j].aclaracion
    };
    Complemento.push(item);
  }
  Recepciones.TotalRecepcionesMes = listIngresos.length;
  Recepciones.TotalDocumentosMes = listIngresos.length;
  Recepciones.SumaVolumenRecepcionMes.ValorNumerico = totalCantidad;
  Recepciones.ImporteTotalRecepcionesMensual = totalImporteTotal;
  Recepciones.Complemento = Complemento;

  return Recepciones;
}



async function listEntregas(user_id,fechaInicio, fechaFin) {
  let Entregas = {
    "TotalEntregasMes": 0,
    "SumaVolumenEntregadoMes": {
      "ValorNumerico": 0,
      "UnidadDeMedida": "UM03"
    },
    "TotalDocumentosMes": 0,
    "ImporteTotalEntregasMes": 15274877.89,
    "Complemento":[]
  }

  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listCompras = await prisma.abastecimientos.findMany({
    where: {
      user_id,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      abastecimiento_id: true,
      proveedor_id: true,
      fecha_emision: true,
      cantidad: true,
      preciounitario: true,
      importe: true,
      tipo_modena_id: true,
      cfdi: true,
      tipoCfdi: true,
      preciovent: true,
      aclaracion: true,
      tipocomplemento: true,
      unidaddemedida: true,
      proveedores: {
        select: {
          name: true,
          rfc: true,
          permiso: true,
        },
      },
    },
  });

  let totalCantidad=0;
  let totalImporteTotal=0;
  let Complemento = [];

  for(let j=0; j<listCompras.length; j++){
    totalCantidad+=listCompras[j].cantidad;
    totalImporteTotal+=listCompras[j].preciovent;

    let item = {
      "TipoComplemento": listCompras[j].tipocomplemento,
      "Nacional": [
        {
          "RfcClienteOProveedor": listCompras[j].proveedores.rfc,
          "NombreClienteOProveedor": listCompras[j].proveedores.name,
          "PermisoClienteOProveedor": listCompras[j].proveedores.permiso,
          "CFDIs": [
            {
              "Cfdi": listCompras[j].cfdi,
              "TipoCfdi": listCompras[j].tipoCfdi,
              "PrecioVentaOCompraOContrap": listCompras[j].preciovent,
                  "FechaYHoraTransaccion": listCompras[j].fecha_emision,
              "VolumenDocumentado": {
                "ValorNumerico": listCompras[j].cantidad,
                "UnidadDeMedida": listCompras[j].unidaddemedida
              }
            }
          ]
        }
      ],
      "Aclaracion": listCompras[j].aclaracion
    };

    Complemento.push(item);
  }
  Entregas.TotalEntregasMes = listCompras.length;
  Entregas.TotalDocumentosMes = listCompras.length;
  Entregas.SumaVolumenEntregadoMes.ValorNumerico = totalCantidad;
  Entregas.ImporteTotalEntregasMes = totalImporteTotal;
  Entregas.Complemento = Complemento;

  return Entregas;
}*/

module.exports = router;