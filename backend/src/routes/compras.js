
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/compras.js');
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');
const fnProveedores = require('../services/proveedores');
const fnCompras = require('../services/compras');
const fnUsuatio = require('../services/users.js');

router.use(fileUpload())

router.post('/',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

  //console.log("Data");
  //console.log(req.body);

  if(!(await fnCompras.findCfdi(req.body.cfdi))) {
    await prisma.abastecimientos.create({
      data: {
        ...req.body,
        permiso_id:parseInt(req.body.permiso_id),
        proveedor_id:parseInt(req.body.proveedor_id),
        user_id: parseInt(req.body.user_id),
        date: date,
        active: 1,
      },
    });
    res.status(200).json({ message:"success" });
  }
  else
    return res.status(400).json({ message:"schema", error: "Ya existe una compra registrada con este UUID"});

});

router.get('/:userId/compras',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listCompras = await prisma.abastecimientos.findMany({
        orderBy: [
          {
            fecha_emision: 'desc',
          },
        ],
        where: {
          //user_id: parseInt(id),
          active: 1,
        },
        select: {
          abastecimiento_id: true,
          proveedor_id: true,
          permiso_id: true,
          folio: true,
          fecha_emision: true,
          cantidad: true,
          concepto: true,
          preciounitario: true,
          importe: true,
          ivaaplicado: true,
          densidad: true,
          permiso: true,
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
              permiso_cre: true,
            },
          },
          permisos: {
            select: {
              permiso_id: true,
              permiso: true
            }
          }
        },
      });
      res.status(200).json({ message:"success", listCompras });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});



const procesarXmls = async (req, res) => {
  for(let j=0;j<Object.keys(req.files.file).length;j++)
  { 
      let EDFile = req.files.file[j];
  
      await EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

        new  Promise(async (resolve,reject)=>{
          dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
          ////console.log(dataJson);
          //listData.push(dataJson)
          await fnCompras.guardarDataJson(dataJson,req.body.user_id,req.body.permiso_id);
        })
      })
  }
}

router.post('/cargarXML', async (req, res, next) => {
  let dataJson;

  /*//console.log(req.body.user_id);
  //console.log(typeof(req.files))
  //console.log(req.files);
  //console.log(Object.keys(req.files.file).length)*/

  await procesarXmls(req, res);
  return res.status(200).send({ message : 'success',dataJson })

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



router.post('/cargarXMLCorreo', async (req, res, next) => {
  ////console.log(req.body.user_id);
          return new Promise(async (resolve,reject)=>{
            try {
            //req.body.dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            ////console.log(req.body.dataJson);
            ////console.log(req.body)

            const rfc = req.body.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

            //console.log("Rfc obtenido",rfc);
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
                    name: req.body.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Nombre,
                    rfc: req.body.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc,
                    direccion: null,
                    tipo_situacion_fiscal: req.body.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].RegimenFiscal,
                    phone: null,
                    email: null,
                    user_id: 1,
                    date: date,
                    active: 1,
                  },
                });
                //console.log("Nuevo proveedor",nuevo);
                proveedor_id = nuevo.proveedor_id;
              }

                const fecha = new Date((req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
                const concepto = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion
                const noIdentificacion = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion?req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion:"";

                const dens = fnCompras.getDensidad(concepto);
                let permiso = fnCompras.getPermiso(concepto);

                //console.log("noIdentificacion",noIdentificacion)

                permiso = permiso?permiso:fnCompras.getPermiso(noIdentificacion);

                //console.log("Rd",dens)

                const densidad = parseFloat(dens===''?0:dens);

                const dataR = {
                  proveedor_id,
                  folio: req.body.dataJson['cfdi:Comprobante']['_attributes'].Folio,
                  fecha_emision: fecha,
                  cantidad: parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
                  concepto,
                  densidad,
                  permiso,
                  preciounitario: parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
                  importe: parseFloat(req.body.dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
                  ivaaplicado: parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Impuestos']['_attributes'].TotalImpuestosTrasladados),
                  cfdi: req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
                  tipoCfdi: 'Ingreso',
                  preciovent: parseFloat(req.body.dataJson['cfdi:Comprobante']['_attributes'].Total),
                  aclaracion: 'SIN OBSERVACIONES',
                  tipocomplemento: 'Comercializacion',
                  unidaddemedida: 'UM03',
                  tipo_modena_id: 1
                }

                if(!(await fnCompras.findCfdi(req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
                  await prisma.abastecimientos.create({
                    data: {
                      ...dataR,
                      proveedor_id:parseInt(proveedor_id),
                      user_id: 1,
                      date: date,
                      active: 1,
                    },
                  });

                  await prisma.seguimiento_facturas_correo.create({
                    data: {
                      folio: dataR.folio,
                      cfdi: dataR.cfdi,
                      tipo_status: 1,
                      nota: "Procesada",
                      tipo_factura_id: 1,
                      date: date,
                    },
                  });

                  return res.status(200).send({ message : 'success' })
                }
                else {
                  await prisma.seguimiento_facturas_correo.create({
                    data: {
                      folio: dataR.folio,
                      cfdi: dataR.cfdi,
                      tipo_status: 2,
                      nota: "El UUDI de la compra  ya se habia registrado",
                      tipo_factura_id: 1,
                      date: date,
                    },
                  });
                  return res.status(400).json({ message:"schema", error: 'El UUDI de la compra  ya se habia registrado' });
                }
            }
          } catch (e) {
            const folio = req.body.dataJson['cfdi:Comprobante']['_attributes'].Folio?req.body.dataJson['cfdi:Comprobante']['_attributes'].Folio:"Folio no encontrado";
            const cfdi = req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID?req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID:"UUID no encontrado";
            let date = new Date().toISOString();

            await prisma.seguimiento_facturas_correo.create({
              data: {
                folio,
                cfdi,
                tipo_status: 2,
                nota: "Error en la obtención de datos de la factura",
                tipo_factura_id: 1,
                date: date,
              },
            });
            return res.status(400).json({ message:"schema", error: 'Error en la obtención de datos de la factura' });
          }
        })
});


router.get('/:userId/listPermisoNulosCompras/:fecha_inicio/:fecha_terminacion', async (req, res, next) => {
  const fi = (req.params.fecha_inicio+"").substring(0,10);
  const ff = (req.params.fecha_terminacion+"").substring(0,10);

  //console.log("Si"+req.params.fecha_terminacion);
  const listComprasSinPermisos = await prisma.abastecimientos.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      permiso: null,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      folio: true,
    },
  });
  return res.status(200).send({ message : 'success',listComprasSinPermisos })
});


router.get('/:userId/list', async (req, res, next) => {
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

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listCompras = await prisma.abastecimientos.findMany({
        where: {
          user_id: parseInt(id),
          active: 1,
          fecha_emision: {
            gte: new Date(req.body.fechaInicio), // Start of date range
			      lte: new Date(req.body.fechaFin), // End of date range
          }
        },
        select: {
          abastecimiento_id: true,
          proveedor_id: true,
          folio: true,
          fecha_emision: true,
          cantidad: true,
          concepto: true,
          preciounitario: true,
          importe: true,
          ivaaplicado: true,
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

      res.status(200).json({ message:"success", Entregas });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});

router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.abastecimiento_id);

  await prisma.abastecimientos.update({
    where: {
      abastecimiento_id: parseInt(id),
    },
    data: {
      ...req.body,
      proveedor_id:parseInt(req.body.proveedor_id),
      permiso_id:parseInt(req.body.permiso_id),
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdAbastecimiento.validate(req.body);
  if (error) {
    //console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.abastecimiento_id);
  await prisma.abastecimientos.update({
    where: {
      abastecimiento_id: parseInt(id),
    },
    data: {
      active: 0,
    },
  });
  res.status(200).json({message:"success"});
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

module.exports = router;