const joi = require('joi');

const schemaCreate = joi.object({
  username: joi.string().alphanum().min(3).required(),
  firstName: joi.string().pattern(new RegExp('^[a-zA-Z\u00C0-\u017F ]{3,100}$')).required(),
  lastName: joi.string().pattern(new RegExp('^[a-zA-Z\u00C0-\u017F ]{3,100}$')).required(),
  password: joi.string().min(3).required(),
  email: joi.string().email().optional().allow(null, ""),
});

const schemaId = joi.object({
  userId: joi.string().alphanum().min(1).required(),
});

const schemaUpdate = joi.object({
  user_id: joi.number().min(1).required(),
  firstname: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).required(),
  lastname: joi.string().pattern(new RegExp('^[a-zA-Z0-9\u00C0-\u017F ]{3,100}$')).required(),
  email: joi.string().email().optional().allow(null, ""),
  password: joi.string().optional().allow(null, ""),
});

const schemaEmail = joi.object({
  email: joi.string().email().required(),
});

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaEmail}