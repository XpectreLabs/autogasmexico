const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  currency: "USD"
})
const dayjs = require ("dayjs");


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
      "ComposDeButanoEnGasLP": 40.0,
      "ReporteDeVolumenMensual": {
        "ControlDeExistencias": {
          "VolumenExistenciasMes": 0.0,
          "FechaYHoraEstaMedicionMes": "2023-09-30T23:59:59-06:00"
        },
      },
      "Recepciones": {},
      "Entregas": {},
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

const generarJson = async (data,date) =>  {

  const fechaEM = dayjs(data.fechayhoraestamedicionmes).subtract(1, 'hour').locale("es").format('YYYY-MM-DDTH:m:ssSSS[Z]');

  dataJson.Version = data.version;
  dataJson.RfcContribuyente = data.rfccontribuyente;
  dataJson.RfcRepresentanteLegal = data.rfcrepresentantelegal;
  dataJson.RfcProveedor = data.rfcproveedor;
  dataJson.Caracter = data.caracter;
  dataJson.ModalidadPermiso = data.modalidadpermiso;
  dataJson.NumPermiso = data.numpermiso;
  dataJson.ClaveInstalacion = data.claveinstalacion;
  dataJson.DescripcionInstalacion = data.descripcioninstalacion;
  dataJson.NumeroPozos = data.numeropozos;
  dataJson.NumeroTanques = data.numerotanques;
  dataJson.NumeroDuctosEntradaSalida = data.numeroductosentradasalida;
  dataJson.NumeroDuctosTransporteDistribucion = data.numeroductostransportedistribucion;
  dataJson.NumeroDispensarios = data.numerodispensarios;
  dataJson.FechaYHoraReporteMes = date;
  dataJson.Producto[0].ClaveProducto = data.claveproducto;
  dataJson.Producto[0].ComposDePropanoEnGasLP = data.composdepropanoengaslp;
  dataJson.Producto[0].ComposDeButanoEnGasLP = data.composdebutanoengaslp;
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.VolumenExistenciasMes = data.volumenexistenciasees;
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.FechaYHoraEstaMedicionMes = fechaEM;
  dataJson.Producto[0].Recepciones = await listRecepciones(parseInt(data.user_id),data.fecha_inicio, data.fecha_terminacion,parseInt(data.permiso_id)),
  dataJson.Producto[0].Entregas = await listEntregas(parseInt(data.user_id),data.fecha_inicio, data.fecha_terminacion,parseInt(data.permiso_id)),
  dataJson.BitacoraMensual[0].NumeroRegistro = data.numeroregistro;
  dataJson.BitacoraMensual[0].FechaYHoraEvento = date;
  dataJson.BitacoraMensual[0].UsuarioResponsable = data.usuarioresponsable;
  dataJson.BitacoraMensual[0].TipoEvento = data.tipoevento;
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
        "RfcClienteOProveedor": listIngresos[j].proveedores.rfc,
        "NombreClienteOProveedor": listIngresos[j].proveedores.name,
        "PermisoClienteOProveedor": listIngresos[j].permiso,
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
  Recepciones.SumaVolumenRecepcionMes.ValorNumerico = formatter.format(totalCantidad).replace(',','');
  Recepciones.ImporteTotalRecepcionesMensual = formatter.format(totalImporteTotal).replace(',','');
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
      permiso_id,
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
          "RfcClienteOProveedor": listCompras[j].clients.rfc,
          "NombreClienteOProveedor": listCompras[j].clients.name,
          "PermisoClienteOProveedor": listCompras[j].permisos.permiso,
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
  Entregas.SumaVolumenEntregadoMes.ValorNumerico = formatter.format(totalCantidad).replace(',','');
  Entregas.ImporteTotalEntregasMes = formatter.format(totalImporteTotal).replace(',','');
  Entregas.Complemento = Complemento;

  return Entregas;
}

module.exports = { generarJson }