const joi = require('joi');

const schemaCreate = joi.object({
  version: joi.string().pattern(new RegExp('^[a-zA-Z0-9-. ]{3,100}$')).required(),
  rfccontribuyente: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  rfcrepresentantelegal: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  rfcproveedor: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  caracter: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  modalidadpermiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  numpermiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{3,100}$')).required(),
  claveinstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  descripcioninstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9-\u00C0-\u017F ]{3,100}$')).required(),
  numeropozos: joi.number().required(),
  numerotanques: joi.number().required(),
  numeroductosentradasalida: joi.number().required(),
  numeroductostransportedistribucion: joi.number().required(),
  numerodispensarios: joi.number().required(),
  claveproducto: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  composdepropanoengaslp: joi.number().required(),
  composdebutanoengaslp: joi.number().required(),
  volumenexistenciasees: joi.number().required(),
  fechayhoraestamedicionmes: joi.date().required(),
  numeroregistro: joi.number().required(),
  usuarioresponsable: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  tipoevento: joi.number().required(),
  descripcionevento: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  fecha_inicio: joi.date().required(),
  fecha_terminacion: joi.date().required(),
  tipo_reporte_id: joi.number().min(1).required(),
  user_id: joi.number().min(1).required(),
});

 const schemaId = joi.object({
   userId: joi.string().alphanum().min(1).required(),
 });

const schemaUpdate = joi.object({
  version: joi.string().pattern(new RegExp('^[a-zA-Z0-9-. ]{3,100}$')).required(),
  rfccontribuyente: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  rfcrepresentantelegal: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  rfcproveedor: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{10,100}$')).required(),
  caracter: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  modalidadpermiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  numpermiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{3,100}$')).required(),
  claveinstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  descripcioninstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9-\u00C0-\u017F ]{3,100}$')).required(),
  numeropozos: joi.number().required(),
  numerotanques: joi.number().required(),
  numeroductosentradasalida: joi.number().required(),
  numeroductostransportedistribucion: joi.number().required(),
  numerodispensarios: joi.number().required(),
  claveproducto: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  composdepropanoengaslp: joi.number().required(),
  composdebutanoengaslp: joi.number().required(),
  volumenexistenciasees: joi.number().required(),
  fechayhoraestamedicionmes: joi.date().required(),
  numeroregistro: joi.number().required(),
  usuarioresponsable: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  tipoevento: joi.number().required(),
  descripcionevento: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  fecha_inicio: joi.date().required(),
  fecha_terminacion: joi.date().required(),
  tipo_reporte_id: joi.number().min(1).required(),
  reporte_id: joi.number().min(1).required(),
  user_id: joi.number().min(1).required(),
});

 const schemaIdReporte = joi.object({
  reporte_id: joi.number().min(1).required(),
 });

module.exports = { schemaCreate, schemaId,schemaUpdate, schemaIdReporte }
//module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdVenta }