const joi = require('joi');

const schemaCreate = joi.object({
  client_id: joi.number().min(1).required(),
  folio: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  fecha_emision: joi.date().required(),
  cantidad: joi.number().required(),
  concepto: joi.string().pattern(new RegExp('^[a-zA-Z0-9/.:(), ]{3,300}$')).required(),
  preciounitario: joi.number().required(),
  importe: joi.number().required(),
  ivaaplicado: joi.number().required(),
  tipo_modena_id: joi.number().min(1).required(),
  cfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipoCfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  preciovent: joi.number().min(1).required(),
  aclaracion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipocomplemento: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  valornumerico: joi.number().min(1).required(),
  unidaddemedida: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  user_id: joi.number().min(1).required(),
});

 const schemaId = joi.object({
   userId: joi.string().alphanum().min(1).required(),
 });

const schemaUpdate = joi.object({
  client_id: joi.number().min(1).required(),
  folio: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,100}$')).required(),
  fecha_emision: joi.date().required(),
  cantidad: joi.number().required(),
  concepto: joi.string().pattern(new RegExp('^[a-zA-Z0-9/.:(), ]{3,300}$')).required(),
  preciounitario: joi.number().required(),
  importe: joi.number().required(),
  ivaaplicado: joi.number().required(),
  tipo_modena_id: joi.number().min(1).required(),
  cfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipoCfdi: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  preciovent: joi.number().min(1).required(),
  aclaracion: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  tipocomplemento: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  valornumerico: joi.number().min(1).required(),
  unidaddemedida: joi.string().pattern(new RegExp('^[a-zA-Z0-9- ]{3,120}$')).required(),
  venta_id: joi.number().min(1).required(),
});

 const schemaIdVenta = joi.object({
  venta_id: joi.number().min(1).required(),
 });

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdVenta }