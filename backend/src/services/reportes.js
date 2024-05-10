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
      }
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
  dataJson.Producto[0].ReporteDeVolumenMensual.ControlDeExistencias.FechaYHoraEstaMedicionMes = data.fechayhoraestamedicionmes;
  dataJson.BitacoraMensual[0].NumeroRegistro = data.numeroregistro;
  dataJson.BitacoraMensual[0].FechaYHoraEvento = date;
  dataJson.BitacoraMensual[0].UsuarioResponsable = data.usuarioresponsable;
  dataJson.BitacoraMensual[0].TipoEvento = data.tipoevento;
  dataJson.BitacoraMensual[0].DescripcionEvento = data.descripcionevento;

  return dataJson;
}

module.exports = { generarJson }