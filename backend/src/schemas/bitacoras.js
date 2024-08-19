const joi = require('joi');

const schemaCreate = joi.object({
  nota: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,500}$')).required(),
  diferencia: joi.number().required(),
  fecha_reporte: joi.date().required(),
  tipo_bitacora: joi.number().min(1).required(),
  user_id: joi.number().min(1).required(),
});

  const schemaId = joi.object({
    userId: joi.string().alphanum().min(1).required(),
  });

 const schemaUpdate = joi.object({
  bitacora_inventario_id: joi.number().min(1).required(),
  nota: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,500}$')).required(),
  diferencia: joi.number().required(),
 });

//  const schemaIdReporte = joi.object({
//   reporte_id: joi.number().min(1).required(),
//  });

module.exports = { schemaCreate, schemaUpdate }
//module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdVenta }