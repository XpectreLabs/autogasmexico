const joi = require('joi');

const schemaCreate = joi.object({
  name: joi.string().pattern(new RegExp('^[a-zA-Z\u00C0-\u017F ]{3,100}$')).required(),
  rfc: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{11,15}$')).required(),
  direccion: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,200}$')).optional().allow(null, ""),
  tipo_situacion_fiscal: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  permiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{4,100}$')).required(),
  phone: joi.string().pattern(new RegExp('^[0-9 ]{7,20}$')).optional().allow(null, ""),
  email: joi.string().email().optional().allow(null, ""),
  user_id: joi.number().min(1).required(),
});

const schemaId = joi.object({
  userId: joi.string().alphanum().min(1).required(),
});

const schemaUpdate = joi.object({
  name: joi.string().pattern(new RegExp('^[a-zA-Z\u00C0-\u017F ]{3,100}$')).required(),
  rfc: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{11,15}$')).required(),
  direccion: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).optional().allow(null, ""),
  tipo_situacion_fiscal: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  permiso: joi.string().pattern(new RegExp('^[a-zA-Z0-9/ ]{4,100}$')).required(),
  phone: joi.string().pattern(new RegExp('^[0-9 ]{7,20}$')).optional().allow(null, ""),
  email: joi.string().email().optional().allow(null, ""),
  proveedor_id: joi.number().min(1).required(),
  id: joi.number().min(1).required(),
});

const schemaIdProveedor = joi.object({
  proveedor_id: joi.number().min(1).required(),
});

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdProveedor}