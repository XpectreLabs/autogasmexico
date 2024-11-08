const joi = require('joi');

 const schemaId = joi.object({
   userId: joi.string().alphanum().min(1).required(),
 });

const schemaUpdate = joi.object({
  permiso_id: joi.number().min(1).required(),
  permiso: joi.string().required(),
  inventario_inicial: joi.number().required(),
  caracter: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  nombre_permiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).required(),
  modalidadpermiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  claveinstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  descripcioninstalacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9-\u00C0-\u017F ]{3,100}$')).required(),
  numeropozos: joi.number().required(),
  numerotanques: joi.number().required(),
  numeroductosentradasalida: joi.number().required(),
  numeroductostransportedistribucion: joi.number().required(),
  numerodispensarios: joi.number().required(),
  claveidentificaciontanque: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  localizacionyodescripciontanque: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  vigenciacalibraciontanque: joi.date().required(),
  valornumericocapacidadtotaltanque: joi.number().required(),
  valornumericocapacidadoperativatanque: joi.number().required(),
  valornumericocapacidadutiltanque: joi.number().required(),
  valornumericocapacidadfondajetanque: joi.number().required(),
  valornumericovolumenminimooperacion: joi.number().required(),
  estadotanque: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{1,20}$')).required(),
  sistemamediciontanque: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  localizodescripsistmediciontanque: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  vigenciacalibracionsistmediciontanque:joi.date().required(),
  incertidumbremedicionsistmediciontanque: joi.number().required(),
});


module.exports = { schemaId, schemaUpdate }