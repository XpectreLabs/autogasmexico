
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/ingresos.js');
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');
router.use(fileUpload());
const fnClientes = require('../services/clients');
const fnCompras = require('../services/compras');
const fnIngresos = require('../services/ingresos');
const fnUsuatio = require('../services/users.js');

router.post('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

  if(!(await fnIngresos.findCfdiI(req.body.cfdi))) {
    await prisma.ventas.create({
      data: {
        ...req.body,
        permiso_id:parseInt(req.body.permiso_id),
        client_id:parseInt(req.body.client_id),
        user_id: parseInt(req.body.user_id),
        date: date,
        active: 1,
      },
    });
    res.status(200).json({ message:"success" });
  }
  else
    return res.status(400).json({ message:"schema", error: "Ya existe una venta registrada con este UUID"});
});

router.get('/:userId/ingresos',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaId.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {
      const listIngresos = await prisma.ventas.findMany({
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
          venta_id: true,
          client_id: true,
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
          clients: {
            select: {
              name: true
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
      res.status(200).json({ message:"success", listIngresos });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});

router.get('/:userId/list', async (req, res, next) => {

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


  if (req.params.userId !== null) {
    const id = req.params.userId;

    if(await fnUsuatio.validateUser(parseInt(id))) {

      const listIngresos = await prisma.ventas.findMany({
        where: {
          user_id: 1,
          active: 1,
          fecha_emision: {
            gte: new Date(req.body.fechaInicio), // Start of date range
			      lte: new Date(req.body.fechaFin), // End of date range
          }
        },
        select: {
          venta_id: true,
          client_id: true,
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
              ]
            }
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

      res.status(200).json({ message:"success", Recepciones });
    }
    else
      res.status(400).json({ message:"Id invalido", error: "Solicitud no válida, el ID no existe" });
  }
});



router.get('/:userId/listPermisoNulosVentas/:fecha_inicio/:fecha_terminacion', async (req, res, next) => {
  const fi = (req.params.fecha_inicio+"").substring(0,10);
  const ff = (req.params.fecha_terminacion+"").substring(0,10);

  const listIngresosSinPermisos = await prisma.ventas.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      permiso_id: null,
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
  return res.status(200).send({ message : 'success',listIngresosSinPermisos })
});

const procesarXmls = async (req, res) => {
  for(let j=0;j<Object.keys(req.files.file).length;j++)
  { 
      let EDFile = req.files.file[j];
  
      await EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

        new Promise(async (resolve,reject)=>{
          dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
          await fnIngresos.guardarDataJson(dataJson,req.body.user_id);
        }) 
      })
  }
}

router.post('/cargarXML', async (req, res, next) => {
  let dataJson;

  try {
    await procesarXmls(req, res);
    return res.status(200).send({ message : 'success',dataJson })  
  }
  catch (e) {
    return res.status(500).send({ message : "error" })
  }

  /*console.log(req.body.user_id);
  let EDFile = req.files.file;

  EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

          dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
          //console.log(dataJson);
          return new Promise(async (resolve,reject)=>{
            //dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            console.log(dataJson);

            const rfc = dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de ventas' });
            else {
              let client_id = await fnClientes.findClient(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",client_id)

              if(client_id===0) {
                const nuevo = await prisma.clients.create({
                  data: {
                    name: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Nombre,
                    rfc: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc,
                    direccion: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor,
                    tipo_situacion_fiscal: dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor,
                    phone: null,
                    email: null,
                    user_id: parseInt(req.body.user_id),
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

              let permiso_id= null;
              let permiso = isArray?permisoVm:fnCompras.getPermiso(concepto);

              if(permiso===""&&!isArray)
              {
                let NoIdentificacion=dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion?dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion:"";
                permiso = fnCompras.getPermiso(NoIdentificacion);
              }

              if(permiso!=="") {
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

              console.log(dataR);

              if(!(await fnIngresos.findCfdiI(dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
                const nV = await prisma.ventas.create({
                  data: {
                    ...dataR,
                    client_id:parseInt(client_id),
                    user_id: parseInt(req.body.user_id),
                    date: date,
                    active: 1,
                  },
                });

                console.log(nV);
                return res.status(200).send({ message : 'success',dataJson })
              }
              else
                return res.status(400).json({ message:"schema", error: 'El UUDI de la venta  ya se habia registrado' });

          }
        })

        //return res.status(200).send({ message : 'success',dataJson })
    })*/
});


router.post('/cargarXMLCorreo', async (req, res, next) => {

          return new Promise(async (resolve,reject)=>{
            try {
            //dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            console.log(req.body.dataJson);

            const rfc = req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de ventas' });
            else {
              let client_id = await fnClientes.findClient(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",client_id)

              if(client_id===0) {
                const nuevo = await prisma.clients.create({
                  data: {
                    name: req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Nombre,
                    rfc: req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].Rfc,
                    //direccion: req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor?req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].DomicilioFiscalReceptor:"",
                    direccion: "Sin registrar",
                    tipo_situacion_fiscal: req.body.dataJson['cfdi:Comprobante']['cfdi:Receptor']['_attributes'].RegimenFiscalReceptor,
                    phone: null,
                    email: null,
                    user_id: 1,
                    date: date,
                    active: 1,
                  },
                });
                console.log("Nuevo cliente",nuevo);
                client_id = nuevo.client_id;
              }

              const isArray = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length?true:false;
              let canCantidadVm = 0, preciounitarioVm = 0, importeVm = 0, ivaaplicadoVm = 0, precioventaVm = 0;
              let descripcionVm = "";
              let permisoVm = "";

              if(isArray) {
                const totalFilas = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'].length;

                for(let j=0; j<totalFilas; j++)
                {
                  const base = parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Base);
                  const iva = parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe);

                  canCantidadVm += parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Cantidad);
                  descripcionVm = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].Descripcion;
                  preciounitarioVm += parseFloat(req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].ValorUnitario);
                  importeVm += base;
                  ivaaplicadoVm += iva;
                  precioventaVm += parseFloat(base + iva);

                  if(j===0){
                    permisoVm = fnCompras.getPermiso(descripcionVm);

                    if(permisoVm==="")
                    {
                      let NoIdentificacion=req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].NoIdentificacion?req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'][j]['_attributes'].NoIdentificacion:"";
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

              const fecha = new Date((req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
              let concepto = isArray?descripcionVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

              let permiso_id= null;
              let permiso = isArray?permisoVm:fnCompras.getPermiso(concepto);

              if(permiso===""&&!isArray)
              {
                let NoIdentificacion=req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion?req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].NoIdentificacion:"";
                permiso = fnCompras.getPermiso(NoIdentificacion);
              }

              if(permiso!=="") {
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
                folio: req.body.dataJson['cfdi:Comprobante']['_attributes'].Folio,
                fecha_emision: fecha,
                cantidad: parseFloat(isArray?canCantidadVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Cantidad),
                unidaddemedida: 'UM03',
                concepto,
                permiso_id,
                preciounitario: parseFloat(isArray?preciounitarioVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].ValorUnitario),
                importe: parseFloat(isArray?importeVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosBaseIVA16:req.body.dataJson['cfdi:Comprobante']['_attributes'].SubTotal),
                ivaaplicado: parseFloat(isArray?ivaaplicadoVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].TotalTrasladosImpuestoIVA16:req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['_attributes'].Importe),
                preciovent: parseFloat(isArray?precioventaVm:req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']?req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Totales']['_attributes'].MontoTotalPagos:req.body.dataJson['cfdi:Comprobante']['_attributes'].Total),
                cfdi: req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID,
                tipoCfdi: 'Ingreso',
                aclaracion: 'SIN OBSERVACIONES',
                tipocomplemento: 'Comercializacion',
                tipo_modena_id: 1
              }

              console.log(dataR);

              if(!(await fnIngresos.findCfdiI(req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].UUID))) {
                const nV = await prisma.ventas.create({
                  data: {
                    ...dataR,
                    client_id:parseInt(client_id),
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
                    tipo_factura_id: 2,
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
                    nota: "El UUDI de la venta  ya se habia registrado",
                    tipo_factura_id: 2,
                    date: date,
                  },
                });
                return res.status(400).json({ message:"schema", error: 'El UUDI de la venta  ya se habia registrado' });
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
              tipo_factura_id: 2,
              date: date,
            },
          });
          return res.status(400).json({ message:"schema", error: 'Error en la obtención de datos de la factura' });
        }


        })
        //return res.status(200).send({ message : 'success',dataJson })
});




router.put('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaUpdate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.venta_id);

  await prisma.ventas.update({
    where: {
      venta_id: parseInt(id),
    },
    data: {
      ...req.body,
      permiso_id:parseInt(req.body.permiso_id),
      client_id:parseInt(req.body.client_id),
    },
  });
  res.status(200).json({ message:"success"});
});

router.delete('/',jwtV.verifyToken, async (req, res, next) => {
  const { error } = sch.schemaIdVenta.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const id = parseInt(req.body.venta_id);
  await prisma.ventas.update({
    where: {
      venta_id: parseInt(id),
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