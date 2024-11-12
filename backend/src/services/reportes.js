const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  currency: "USD"
})
const dayjs = require ("dayjs");
const fnPermisos = require('../services/permisos');
let totFinalCompras = 0;
let totFinalIngresos = 0;


let dataJson = {
  "Version": "1.012",
  "RfcContribuyente": "AME050309Q32",
  "RfcRepresentanteLegal": "IAJA7201074W4",
  "RfcProveedor": "APR9609194H4",
  "Caracter": "permisionario",
  "ModalidadPermiso": "PER45",
  "NumPermiso": "LP/22811/COM/2019",
  "ClaveInstalacion": "CMN-0001",
  "DescripcionInstalacion": "CMN-Comercialización",
  "NumeroPozos": 0,
  "NumeroTanques": 1,
  "NumeroDuctosEntradaSalida": 0,
  "NumeroDuctosTransporteDistribucion": 0,
  "NumeroDispensarios": 0,
  "FechaYHoraReporteMes": "2024-04-09T17:22:58-06:00",
  "Producto": [
    {
      "ClaveProducto": "PR12",
      "ComposDePropanoEnGasLP": 60.0,
      "ComposDeButanoEnGasLP": 20.0,
      "ReporteDeVolumenMensual": {
        "ControlDeExistencias": {
          "VolumenExistenciasMes": 0.0,
          "FechaYHoraEstaMedicionMes": "2023-09-30T23:59:59-06:00"
        },
        "Recepciones": {},
        "Entregas": {},
      },
    }
  ],
  "BitacoraMensual": [
    {
      "NumeroRegistro": 2033,
      "FechaYHoraEvento": "2024-04-09T17:22:58-06:00",
      "UsuarioResponsable": "ANGEL LUIS IBARRA",
      "TipoEvento": 5,
      "DescripcionEvento": "Consulta Informacion"
    }
  ]
}

const generarJson = async (data,date,version="",numeroregistro="",volumenexistenciasees=0.0,numpermiso="") =>  {
  //const fechaEM = dayjs(data.fechayhoraestamedicionmes).subtract(1, 'hour').locale("es").format('YYYY-MM-DDTH:m:ssSSS[Z]');
  const fechaEM = dayjs(data.fechayhoraestamedicionmes).format('YYYY-MM-DDTHH:mm:ss[-]HH:mm');

  //console.log(numpermiso);
  //console.log("volumenexistenciasees",volumenexistenciasees);

  //console.log("ja", (parseFloat(data.composdepropanoengaslp).toFixed(2)))
  //console.log("data.numpermiso",data.numpermiso);
  dataJson.Version = version?version:data.version;
  dataJson.RfcContribuyente = data.rfccontribuyente;
  dataJson.RfcRepresentanteLegal = data.rfcrepresentantelegal;
  dataJson.RfcProveedor = data.rfcproveedor;
  dataJson.Caracter = data.caracter;
  dataJson.ModalidadPermiso = data.modalidadpermiso;
  dataJson.NumPermiso = numpermiso;
  dataJson.ClaveInstalacion = data.claveinstalacion;
  dataJson.DescripcionInstalacion = data.descripcioninstalacion;
  dataJson.NumeroPozos = data.numeropozos;
  dataJson.NumeroTanques = data.numerotanques;
  dataJson.NumeroDuctosEntradaSalida = data.numeroductosentradasalida;
  dataJson.NumeroDuctosTransporteDistribucion = data.numeroductostransportedistribucion;
  dataJson.NumeroDispensarios = data.numerodispensarios;
  dataJson.FechaYHoraReporteMes = date;
  dataJson.Producto[0].ClaveProducto = data.claveproducto;
  dataJson.Producto[0].ComposDePropanoEnGasLP = parseFloat(parseFloat(data.composdepropanoengaslp).toFixed(1));
  dataJson.Producto[0].ComposDeButanoEnGasLP = parseFloat(parseFloat(data.composdebutanoengaslp).toFixed(1));
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.VolumenExistenciasMes = parseFloat(parseFloat(volumenexistenciasees).toFixed(2));
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.FechaYHoraEstaMedicionMes = fechaEM;
  dataJson.Producto[0].ReporteDeVolumenMensual.Recepciones = await listRecepciones(parseInt(data.user_id),data.fecha_inicio, data.fecha_terminacion,parseInt(data.permiso_id)),
  dataJson.Producto[0].ReporteDeVolumenMensual.Entregas = await listEntregas(parseInt(data.user_id),data.fecha_inicio, data.fecha_terminacion,parseInt(data.permiso_id)),
  //console.log("Final",totFinalCompras,totFinalIngresos)

  volumenexistenciasees = (totFinalCompras-totFinalIngresos)+volumenexistenciasees;
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.VolumenExistenciasMes = parseFloat(parseFloat(volumenexistenciasees).toFixed(2));


  dataJson.BitacoraMensual[0].NumeroRegistro = numeroregistro?numeroregistro:data.numeroregistro;
  dataJson.BitacoraMensual[0].FechaYHoraEvento = date;
  dataJson.BitacoraMensual[0].UsuarioResponsable = data.usuarioresponsable;
  dataJson.BitacoraMensual[0].TipoEvento = parseInt(data.tipoevento);
  dataJson.BitacoraMensual[0].DescripcionEvento = data.descripcionevento;

  return dataJson;
}



async function listRecepciones(user_id,fechaInicio, fechaFin,permiso_id) {
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

  const listIngresos = await prisma.abastecimientos.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      user_id,
      permiso_id,
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
      permiso: true,
      proveedores: {
        select: {
          name: true,
          rfc: true,
          permiso_cre: true,
        },
      },
    },
  });

  let totalCantidad=0;
  let totalImporteTotal=0;
  let Complemento = [];
  let ban=false;

  for(let j=0; j<listIngresos.length; j++){
    totalCantidad+=listIngresos[j].cantidad;
    totalImporteTotal+=listIngresos[j].preciovent;
    const permiso_cre = listIngresos[j].proveedores.permiso_cre?listIngresos[j].proveedores.permiso_cre:"NO TIENE EL PERMISO ASIGNADO";

    let item = {
      "TipoComplemento": listIngresos[j].tipocomplemento,
      "Nacional": [
      {
        "RfcClienteOProveedor": listIngresos[j].proveedores.rfc,
        "NombreClienteOProveedor": listIngresos[j].proveedores.name,
        "PermisoClienteOProveedor": permiso_cre,
        "CFDIs": [
        {
          "Cfdi": listIngresos[j].cfdi,
          "TipoCfdi": listIngresos[j].tipoCfdi,
          "PrecioVentaOCompraOContrap": listIngresos[j].preciovent,
          "FechaYHoraTransaccion": dayjs(listIngresos[j].fecha_emision).format('YYYY-MM-DDTHH:mm:ss[-]HH:mm'),
          "VolumenDocumentado": {
            "ValorNumerico": parseFloat(parseFloat(listIngresos[j].cantidad).toFixed(2)),
            "UnidadDeMedida": listIngresos[j].unidaddemedida
          }
        }
      ]}
    ],
      "Aclaracion": listIngresos[j].aclaracion
    };

    ban=true;
    Complemento.push(item);
  }

  if(!ban) {
    let item = {
      "TipoComplemento": "Comercializacion",
      "Aclaracion": "Generación de Volumetrico Sin Recepciones"
    };
    Complemento.push(item);
  }

  totFinalCompras = totalCantidad;
  Recepciones.TotalRecepcionesMes = listIngresos.length;
  Recepciones.TotalDocumentosMes = listIngresos.length;
  Recepciones.SumaVolumenRecepcionMes.ValorNumerico = parseFloat(parseFloat(formatter.format(totalCantidad).replace(',','')).toFixed(2)) ;
  Recepciones.ImporteTotalRecepcionesMensual = parseFloat(parseFloat(formatter.format(totalImporteTotal).replace(',','')).toFixed(2));
  Recepciones.Complemento = Complemento;

  return Recepciones;
}



async function listEntregas(user_id,fechaInicio, fechaFin,permiso_id) {
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

  const listCompras = await prisma.ventas.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      user_id,
      active: 1,
      //permiso_id,
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

   //console.log("permiso_id",permiso_id);
   ////console.log("listCompras",listCompras);

  let totalCantidad=0;
  let totalImporteTotal=0;
  let Complemento = [];
  let ban=false;

  for(let j=0; j<listCompras.length; j++){
    totalCantidad+=listCompras[j].cantidad;
    totalImporteTotal+=listCompras[j].preciovent;
    const permiso = listCompras[j].permisos?listCompras[j].permisos.permiso:"NO TIENE EL PERMISO ASIGNADO";

    let item = {
      "TipoComplemento": listCompras[j].tipocomplemento,
      "Nacional": [
        {
          "RfcClienteOProveedor": listCompras[j].clients.rfc,
          "NombreClienteOProveedor": listCompras[j].clients.name,
          "PermisoClienteOProveedor": permiso,
          "CFDIs": [
            {
              "Cfdi": listCompras[j].cfdi,
              "TipoCfdi": listCompras[j].tipoCfdi,
              "PrecioVentaOCompraOContrap": listCompras[j].preciovent,
                  "FechaYHoraTransaccion": dayjs(listCompras[j].fecha_emision).format('YYYY-MM-DDTHH:mm:ss[-]HH:mm'),
              "VolumenDocumentado": {
                "ValorNumerico": parseFloat(parseFloat(listCompras[j].cantidad).toFixed(2)),
                "UnidadDeMedida": listCompras[j].unidaddemedida
              }
            }
          ]
        }
      ],
      "Aclaracion": listCompras[j].aclaracion
    };

    Complemento.push(item);
    ban=true;
  }

  if(!ban) {
    let item = {
      "TipoComplemento": "Comercializacion",
      "Aclaracion": "Generación de Volumetrico Sin Entregas"
    };
    Complemento.push(item);
  }

  totFinalIngresos = totalCantidad;
  Entregas.TotalEntregasMes = listCompras.length;
  Entregas.TotalDocumentosMes = listCompras.length;
  Entregas.SumaVolumenEntregadoMes.ValorNumerico = parseFloat(parseFloat(formatter.format(totalCantidad).replace(',','')).toFixed(2));
  Entregas.ImporteTotalEntregasMes = parseFloat(parseFloat(formatter.format(totalImporteTotal).replace(',','')).toFixed(2));
  Entregas.Complemento = Complemento;

  return Entregas;
}


async function totalRecepciones(fechaInicio, fechaFin,permiso_id) {
  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listIngresos = await prisma.abastecimientos.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range}
      }
    },
    select: {
      cantidad: true,
    },
  });

  let totalCantidad=0.0;

  for(let j=0; j<listIngresos.length; j++)
    totalCantidad+=parseFloat(listIngresos[j].cantidad);

  const inv_ini = await fnPermisos.findInventarioInicial(permiso_id);
  //console.log("inv_ini",inv_ini);

  totalCantidad+=inv_ini;

  return totalCantidad.toFixed(2);
}

async function totalEntregas(fechaInicio, fechaFin,permiso_id) {
  const fi = (fechaInicio+"").substring(0,10);
  const ff = (fechaFin+"").substring(0,10);

  const listCompras = await prisma.ventas.findMany({
    orderBy: [
      {
        fecha_emision: 'asc',
      },
    ],
    where: {
      active: 1,
      fecha_emision: {
        gte: new Date(fi), // Start of date range
			  lte: new Date(ff), // End of date range
      }
    },
    select: {
      cantidad: true
    },
   });


  let totalCantidad=0;

  for(let j=0; j<listCompras.length; j++){
    totalCantidad+=listCompras[j].cantidad;
  }

  return totalCantidad.toFixed(2);
}



const obtenerConsecutivos = async () =>  {
  const total = await prisma.reportes.aggregate({
    _count: {
      reporte_id: true,
    },
  })

  let data = {
    //version: "1."+(parseInt(total._count.reporte_id)+1),
    version: "1.0",
    numeroregistro: (parseInt(total._count.reporte_id)+1)
  }
  //console.log("Total de registro: 1."+(parseInt(total._count.reporte_id)+1));
  return data;
}

const obtenerMesAnterior = async (fecha) =>  {
  let mesAnteriorInicio=dayjs(fecha).subtract(1, "month").format("YYYY-MM-DD");
  let diasMesAnterior= dayjs(mesAnteriorInicio).daysInMonth();
  let mesAnterior = dayjs(mesAnteriorInicio).month()+1;
  mesAnterior=mesAnterior<10?"0"+mesAnterior:mesAnterior;
  let anioAnterior = dayjs(mesAnteriorInicio).year();
  let mesAnteriorFinal = anioAnterior+"-"+mesAnterior+"-"+diasMesAnterior;

  mesAnteriorInicio=new Date("2022-01-01");
  //console.log("2022-01-01",mesAnteriorFinal)
  //console.log(mesAnteriorInicio,mesAnteriorFinal)
  //console.log("anioAnterior",anioAnterior)
  let data = {
    fechaInicio: mesAnteriorInicio,
    fechaFinal: mesAnteriorFinal
  }
  return data;
}

module.exports = { generarJson,obtenerConsecutivos,obtenerMesAnterior,totalRecepciones,totalEntregas }