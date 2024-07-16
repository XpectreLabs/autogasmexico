const joi = require('joi');

const schemaCreate = joi.object({
  proveedor_id: joi.number().min(1).required(),
  folio: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  //serie: joi.string().pattern(new RegExp('^[a-zA-Z ]{1,20}$')).required(),
  //folio_fiscal: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  fecha_emision: joi.date().required(),
  //fecha_timbrado: joi.date().format('DD/MM/YYYY').required(),
  //lugar_expansion: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  //exportacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9() ]{3,100}$')).required(),
  //uso: joi.string().pattern(new RegExp('^[a-zA-Z0-9() ]{3,100}$')).required(),
  cantidad: joi.number().required(),
  //unidad: joi.number().optional().allow(null, ""),
  concepto: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F/.:(), ]{3,300}$')).required(),
  densidad: joi.number().required(),
  permiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{4,100}$')).required(),
  preciounitario: joi.number().required(),
  importe: joi.number().required(),
  ivaaplicado: joi.number().required(),
  tipo_modena_id: joi.number().min(1).required(),
  //condicion_pago_id: joi.number().min(1).required(),
  cfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipoCfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  preciovent: joi.number().min(1).required(),
  aclaracion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipocomplemento: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).required(),
  unidaddemedida: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  user_id: joi.number().min(1).required(),
});

 const schemaId = joi.object({
   userId: joi.string().alphanum().min(1).required(),
 });

const schemaUpdate = joi.object({
  proveedor_id: joi.number().min(1).required(),
  folio: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  //serie: joi.string().pattern(new RegExp('^[a-zA-Z ]{1,20}$')).required(),
  //folio_fiscal: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  fecha_emision: joi.date().required(),
  //fecha_timbrado: joi.date().format('DD/MM/YYYY').required(),
  //lugar_expansion: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  //exportacion: joi.string().pattern(new RegExp('^[a-zA-Z0-9() ]{3,100}$')).required(),
  //uso: joi.string().pattern(new RegExp('^[a-zA-Z0-9() ]{3,100}$')).required(),
  cantidad: joi.number().required(),
  //unidad: joi.number().optional().allow(null, ""),
  concepto: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F/.:(), ]{3,300}$')).required(),
  densidad: joi.number().required(),
  permiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{4,100}$')).required(),
  preciounitario: joi.number().required(),
  importe: joi.number().required(),
  ivaaplicado: joi.number().required(),
  tipo_modena_id: joi.number().min(1).required(),
  //condicion_pago_id: joi.number().min(1).required(),
  cfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipoCfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  preciovent: joi.number().min(1).required(),
  aclaracion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipocomplemento: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).required(),
  unidaddemedida: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  abastecimiento_id: joi.number().min(1).required(),
  //id: joi.number().min(1).required(),
});

 const schemaIdAbastecimiento = joi.object({
  abastecimiento_id: joi.number().min(1).required(),
 });

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdAbastecimiento }
