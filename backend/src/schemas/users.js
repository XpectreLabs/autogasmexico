const joi = require('joi');

const schemaCreate = joi.object({
  username: joi.string().alphanum().min(3).required(),
  firstName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  lastName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  password: joi.string().min(3).required(),
  email: joi.string().email().required(),
});

const schemaId = joi.object({
  userId: joi.string().alphanum().min(1).required(),
});

const schemaUpdate = joi.object({
  user_id: joi.number().min(1).required(),
  firstName: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  lastName: joi.string().pattern(new RegExp('^[a-zA-Z0-9 ]{3,100}$')).required(),
  email: joi.string().email().required(),
});

const schemaEmail = joi.object({
  email: joi.string().email().required(),
});

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaEmail}