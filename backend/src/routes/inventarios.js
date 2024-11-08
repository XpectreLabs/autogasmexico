
const express = require("express");
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtV = require('../services/auth.js');
const sch = require('../schemas/inventario.js');
const fileUpload = require('express-fileupload');
const xmlJs = require('xml-js');
const fs = require('fs');
const fnPermisos = require('../services/permisos.js');
const fnCompras = require('../services/compras.js');
const { isNull } = require("util");

router.use(fileUpload())

/*router.post('/',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema", error: error.details[0].message });
  }

  let date = new Date().toISOString();

  console.log("Data");
  console.log(req.body);

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

});*/

router.get('/:user_id/inventarios/:permiso_id/:anio/:mes/:dia',jwtV.verifyToken, async (req, res, next) => {

  const { error } = sch.schemaCreate.validate(req.params);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).json({ message:"schema",error: error.details[0].message });
  }

  const mesRecibido = parseInt(req.params.mes+"");
  const diaRecibido = parseInt(req.params.dia+"");
  console.log("Mes enviado: "+mesRecibido);
  console.log("Tipo: "+typeof(req.params.permiso_id))

  let meses = [31,28,31,30,31,30,31,31,30,31,30,31];
  let mesesNombre = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const anio = parseInt(req.params.anio);
  let listInventario = [];
  let totalInvIni=0, totalCompras =0, totalVentas=0, totalInvFi=0;

  const user_id = parseInt(req.params.user_id)
  const permiso_id = parseInt(req.params.permiso_id)

  //console.log("Yes 0 -> "+mesRecibido);
  //console.log("permiso_id",permiso_id)

  const inv_ini = await fnPermisos.findInventarioInicial(permiso_id);

  if(mesRecibido===0) {
    //console.log("Yes 1: ",anio);
    for(let j=0; j<12; j++) {
      //console.log("Yes 2");
      let diaBisiesto = j==1?anio%4===0?1:0:0;
      let diasMes = meses[j]+diaBisiesto;
      const mes = (j+1)<10?("0"+(j+1)):(j+1);
      const fechaInicio = anio+"-"+mes+"-"+"01";
      const fechaFin = anio+"-"+mes+"-"+diasMes;
      const totalCompra = await totalRecepcion(user_id,fechaInicio, fechaFin,permiso_id);
      const totalVenta = await totalEntregas(user_id,fechaInicio, fechaFin,permiso_id);

      let inventarioInicial,inventarioFinal;
      let diferencia = 0;
      let diferenciaReportada = 0;
      let diferenciaReportadaR = 0;
      let inventarioFisico = 0;
      let porcentajeDiferencia = 0;
      let bitacora = "";
      let bitacora_inventario_id="";

      if(j===0) {
        inventarioInicial=0;
        if(anio==2022&&j==0)
          inventarioInicial+=inv_ini;
        else if(anio>2022&&j==0) {
          const fechaInicio="2022-01-01";
          const fechaFin = (anio-1)+"-12-31";
          const totalCompra = await totalRecepcion(user_id,fechaInicio, fechaFin,permiso_id);
          const totalVenta = await totalEntregas(user_id,fechaInicio, fechaFin,permiso_id);

          inventarioInicial+=(totalCompra-totalVenta)+inv_ini;
        }  
      }
        
      else
        inventarioInicial = permiso_id===1?listInventario[j-1].inventarioFisico:listInventario[j-1].inventarioFinal;

      const sumaIC = inventarioInicial + totalCompra;
      inventarioFinal = sumaIC - totalVenta;

      //console.log("Total compra "+mesesNombre[j]+": " + totalCompra);
      //console.log("Total venta "+mesesNombre[j]+": " + totalVenta);

      totalInvIni+=inventarioInicial;
      totalCompras += totalCompra;
      totalVentas += totalVenta;
      totalInvFi += inventarioFinal;

      let item;

      if(permiso_id===1) {
        const fB = await findBitacora(fechaFin,1,permiso_id);
        const tB = await totalEnBitacora(fechaInicio,fechaFin,permiso_id);
        //const fB = await totalEnBitacora(fechaInicio,fechaFin);
        //console.log("fb",fB)

        if(fB!==0) {
          console.log("tb: "+tB);
          console.log("Dif: "+fB.diferencia);
          console.log("Diferencia: "+(parseFloat(tB)-parseFloat(fB.diferencia)))
          bitacora_inventario_id =  fB.bitacora_inventario_id;
          diferenciaReportada = parseFloat(tB);
          diferenciaReportadaR = parseFloat(fB.diferencia);
          bitacora = fB.nota;
        }
        else {
          diferenciaReportada = parseFloat(tB);
        }

        inventarioFisico = sumaIC - totalVenta + diferenciaReportada;
        diferencia = inventarioFisico - inventarioFinal;
        porcentajeDiferencia = parseFloat(diferencia) / parseFloat(totalVenta);
        porcentajeDiferencia = isNaN(porcentajeDiferencia)?0:porcentajeDiferencia===Infinity?0:porcentajeDiferencia;

        //console.log(diferencia,totalVenta);
        //console.log("porcentajeDiferencia:"+porcentajeDiferencia+" ->"+diferencia / totalVenta);

        item = {
          "id": j,
          "mes": mesesNombre[j]+" "+anio,
          "inventarioInicial": inventarioInicial,
          "compras": totalCompra,
          "ventas": totalVenta,
          "inventarioFinal": inventarioFinal,
          "inventarioFisico": inventarioFisico,
          "diferencia": diferencia,
          "diferenciaR": diferenciaReportadaR,
          "porcentajeDiferencia": porcentajeDiferencia,
          "nota": bitacora,
          "fecha":fechaFin,
          "bitacora_inventario_id": bitacora_inventario_id,
          "tipo_bitacora":1
        }
      }
      else {
        const fB = await findBitacora(fechaFin,1,permiso_id);

        if(fB!==0) {
          bitacora_inventario_id =  fB.bitacora_inventario_id;
          bitacora = fB.nota;
        }

        item = {
          "id": j,
          "mes": mesesNombre[j]+" "+anio,
          "inventarioInicial": inventarioInicial,
          "compras": totalCompra,
          "ventas": totalVenta,
          "inventarioFinal": inventarioFinal,
          "bitacora_inventario_id": bitacora_inventario_id,
          "nota": bitacora,
          "fecha":fechaFin,
          "tipo_bitacora":1
        }
      }
      listInventario.push(item);
    }

    let item;

    if(permiso_id===1) {
      item = {
        "id": 12,
        "mes": "TOTALES",
        "inventarioInicial": 0,
        "compras": totalCompras,
        "ventas": totalVentas,
        "inventarioFinal": 0,
        "inventarioFisico": "",
        "diferencia": "",
        "porcentajeDiferencia":"",
        "nota": "",
        "fecha":"",
        "bitacora_inventario_id": "",
        "tipo_bitacora":1
      }
    }
    else {
      item = {
        "id": 12,
        "mes": "TOTALES",
        "inventarioInicial": 0,
        "compras": totalCompras,
        "ventas": totalVentas,
        "inventarioFinal": 0,
        "fecha":"",
        "tipo_bitacora":1
      }
    }

    listInventario.push(item);
  }
  else {
    let diaBisiesto = anio%4===0?1:0;
    let diasMes = meses[mesRecibido-1]+diaBisiesto;
    const mes = (mesRecibido)<10?("0"+mesRecibido):mesRecibido;

    //mesRecibido
    for(let j=0; j<diasMes-2; j++) {
      let dia = (j+1)<10?("0"+(j+1)):(j+1);

      if(diaRecibido!==0){
        const diaP = diaRecibido<10?("0"+diaRecibido):diaRecibido;
        dia = diaP;
      }


      const fechaInicio = anio+"-"+mes+"-"+dia;
      const fechaFin = anio+"-"+mes+"-"+dia;
      const totalCompra = await totalRecepcion(user_id, fechaInicio, fechaFin, permiso_id);
      const totalVenta = await totalEntregas(user_id, fechaInicio, fechaFin, permiso_id);
      let inventarioInicial,inventarioFinal;
      let diferencia = 0;
      let diferenciaReportada = 0;
      let inventarioFisico = 0;
      let porcentajeDiferencia = 0;
      let bitacora = "";
      let bitacora_inventario_id="";

      if(j===0)
        inventarioInicial=0;
      else
        inventarioInicial = permiso_id===1?listInventario[j-1].inventarioFisico:listInventario[j-1].inventarioFinal;

      const sumaIC = inventarioInicial + totalCompra;
      inventarioFinal = sumaIC - totalVenta;

      //console.log("Total compra "+mesesNombre[j]+": " + totalCompra);
      //console.log("Total venta "+mesesNombre[j]+": " + totalVenta);

      totalInvIni+=inventarioInicial;
      totalCompras += totalCompra;
      totalVentas += totalVenta;
      totalInvFi += inventarioFinal;

      let item;

      if(permiso_id===1) {
        const fB = await findBitacora(fechaFin,2,permiso_id);
        //console.log("fb",fB)

        if(fB!==0) {
          bitacora_inventario_id =  fB.bitacora_inventario_id;
          diferenciaReportada = fB.diferencia;
          bitacora = fB.nota;
        }

        inventarioFisico = sumaIC - totalVenta + diferenciaReportada;

        console.log("inventarioInicial: "+inventarioInicial);
        console.log("totalCompra: "+totalCompra);
        console.log("totalVenta: "+totalVenta);
        console.log("inventarioFinal: "+inventarioFinal);
        console.log("inventarioFisico: "+inventarioFisico);

        diferencia = inventarioFisico - inventarioFinal;
        porcentajeDiferencia = parseFloat(diferencia) / parseFloat(totalVenta);
        porcentajeDiferencia = isNaN(porcentajeDiferencia)?0:porcentajeDiferencia===Infinity?0:porcentajeDiferencia;

        //console.log(diferencia,totalVenta);
        //console.log("porcentajeDiferencia:"+porcentajeDiferencia+" ->"+diferencia / totalVenta);

        item = {
          "id": j,
          "mes": dia+"/"+mes+"/"+anio,
          "inventarioInicial": inventarioInicial,
          "compras": totalCompra,
          "ventas": totalVenta,
          "inventarioFinal": inventarioFinal,
          "inventarioFisico": inventarioFisico,
          "diferencia": diferencia,
          "diferenciaR": diferencia,
          "porcentajeDiferencia": porcentajeDiferencia,
          "nota": bitacora,
          "fecha":fechaFin,
          "bitacora_inventario_id": bitacora_inventario_id,
          "tipo_bitacora":2
        }
      }
      else {
        const fB = await findBitacora(fechaFin,2,permiso_id);

        if(fB!==0) {
          bitacora_inventario_id =  fB.bitacora_inventario_id;
          bitacora = fB.nota;
        }

        item = {
          "id": j,
          "mes": dia+"/"+mes+"/"+anio,
          "inventarioInicial": inventarioInicial,
          "compras": totalCompra,
          "ventas": totalVenta,
          "inventarioFinal": inventarioFinal,
          "fecha":fechaFin,
          "tipo_bitacora":2,
          "nota": bitacora,
          "bitacora_inventario_id": bitacora_inventario_id,
        }
      }
      listInventario.push(item);

      if(diaRecibido!==0)
        break;
    }


    let item;

    if(diaRecibido!==0){
      diasMes = 2;
    }

    if(permiso_id===1) {
      item = {
        "id": diasMes,
        "mes": "TOTALES",
        "inventarioInicial": 0,
        "compras": totalCompras,
        "ventas": totalVentas,
        "inventarioFinal": 0,
        "inventarioFisico": "",
        "diferencia": "",
        "porcentajeDiferencia":"",
        "nota": "",
        "fecha":"",
        "bitacora_inventario_id": "",
        "tipo_bitacora":2
      }
    }
    else {
      item = {
        "id": diasMes,
        "mes": "TOTALES",
        "inventarioInicial": 0,
        "compras": totalCompras,
        "ventas": totalVentas,
        "inventarioFinal": 0,
        "fecha":"",
        "tipo_bitacora":2
      }
    }

    listInventario.push(item);
  }




  //console.log(listInventario);

  res.status(200).json({ message:"success",listInventario});
});



async function totalRecepcion(user_id,fechaInicio, fechaFin,permiso_id) {
  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  console.log(fi,ff);

  const listIngresos = await prisma.abastecimientos.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      //Ajuste por usuario ocultamiento de user_id
      //user_id,
      //permiso_id:permiso_id,
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      cantidad: true,
    },
  });

  let totalImporteTotal=0;

  //console.log("Len"+listIngresos.length);
  for(let j=0; j<listIngresos.length; j++){
    totalImporteTotal+=listIngresos[j].cantidad;
  }

  return totalImporteTotal;
}



async function totalEntregas(user_id,fechaInicio, fechaFin,permiso_id) {
  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listCompras = await prisma.ventas.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      //Ajuste por usuario ocultamiento de user_id
      //user_id,
      active: 1,
      //permiso_id,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range
      }
    },
    select: {
      cantidad: true
    },
   });

  let totalImporteTotal=0;

  console.log(fi,listCompras);

  for(let j=0; j<listCompras.length; j++){
    totalImporteTotal+=listCompras[j].cantidad;
  }
  return totalImporteTotal;
}


async function findBitacora(fecha_reporte,tipo_bitacora,permiso_id) {

  fecha_reporte = new Date(fecha_reporte);

  const dataBitacora = await prisma.bitacoras_inventario.findFirst({
    where: {
      fecha_reporte,
      tipo_bitacora,
      permiso_id,
      active: 1,
    },
    select: {
      bitacora_inventario_id: true,
      nota: true,
      diferencia: true
    },
   });

   //console.log("dataBitacora",dataBitacora)
   if (dataBitacora == null) return 0;

  return dataBitacora;
}


async function totalEnBitacora(fecha_inicio, fecha_terminacion,permiso_id) {

  //fecha_reporte = new Date(fecha_reporte);

  const dataBitacora = await prisma.bitacoras_inventario.aggregate({
    _sum: {
      diferencia: true,
    },
    where: {
      permiso_id,
      active: 1,
      fecha_reporte: {
        gte: new Date(fecha_inicio), // Start of date range
			  lte: new Date(fecha_terminacion), // End of date range
      }
    },
   });

   const sumT = dataBitacora._sum.diferencia!=null?dataBitacora._sum.diferencia:0;
   console.log("Resultado s: "+sumT)
   console.log('Suma:' + dataBitacora._sum.diferencia)

  return sumT;
}
/*router.post('/cargarXML', async (req, res, next) => {
  let dataJson;

  console.log(req.body.user_id);
  let EDFile = req.files.file;
  EDFile.mv (`./xmls//${EDFile.name}`,err => {
        if(err) return res.status(500).send({ message : err })

          return new Promise(async (resolve,reject)=>{
            dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            console.log(dataJson);

            const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de compras' });
            else {
              let proveedor_id = await fnProveedores.findProveedor(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",proveedor_id)

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
                console.log("Nuevo proveedor",nuevo);
                proveedor_id = nuevo.proveedor_id;
              }

                const fecha = new Date((dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
                const concepto = dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

                const dens = fnCompras.getDensidad(concepto);
                const permiso = fnCompras.getPermiso(concepto);
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

                  return res.status(200).send({ message : 'success',dataJson })
                }
                else
                  return res.status(400).json({ message:"schema", error: 'El UUDI de la compra  ya se habia registrado' });
            }
        })
    })
});



router.post('/cargarXMLCorreo', async (req, res, next) => {
  //console.log(req.body.user_id);
          return new Promise(async (resolve,reject)=>{
            //req.body.dataJson = JSON.parse(xmlJs.xml2json((fs.readFileSync('./xmls/'+EDFile.name, 'utf8')), {compact: true, spaces: 4}));
            //console.log(req.body.dataJson);
            //console.log(req.body)

            const rfc = req.body.dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;

            console.log("Rfc obtenido",rfc);
            if(rfc==='AME050309Q32')
              return res.status(400).json({ message:"schema", error: 'El XML no es de compras' });
            else {
              let proveedor_id = await fnProveedores.findProveedor(rfc);
              let date = new Date().toISOString();

              console.log("rfc",rfc);
              console.log("ID",proveedor_id)

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
                console.log("Nuevo proveedor",nuevo);
                proveedor_id = nuevo.proveedor_id;
              }

                const fecha = new Date((req.body.dataJson['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital']['_attributes'].FechaTimbrado+"").substr(0,10)).toISOString();
                const concepto = req.body.dataJson['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto']['_attributes'].Descripcion

                const dens = fnCompras.getDensidad(concepto);
                const permiso = fnCompras.getPermiso(concepto);
                console.log("Rd",dens)

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

                  return res.status(200).send({ message : 'success' })
                }
                else
                  return res.status(400).json({ message:"schema", error: 'El UUDI de la compra  ya se habia registrado' });
            }
        })
});


router.get('/:userId/listPermisoNulosCompras/:fecha_inicio/:fecha_terminacion', async (req, res, next) => {
  const fi = (req.params.fecha_inicio+"").substring(0,10);
  const ff = (req.params.fecha_terminacion+"").substring(0,10);

  console.log("Si"+req.params.fecha_terminacion);
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

    if(await validateUser(parseInt(id))) {
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
    console.log(error.details[0].message);
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
    console.log(error.details[0].message);
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
});*/


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