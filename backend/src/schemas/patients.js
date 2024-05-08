const joi = require('joi');

const schemaCreate = joi.object({
  firstName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  lastName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  phone: joi.string().pattern(new RegExp('^[0-9 ]{7,20}$')).required(),
  email: joi.string().email().required(),
  ssn: joi.string().min(3).required(),
  user_id: joi.number().min(1).required(),
});

const schemaId = joi.object({
  userId: joi.string().alphanum().min(1).required(),
});

const schemaUpdate = joi.object({
  firstName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  lastName: joi.string().pattern(new RegExp('^[a-zA-Z ]{3,100}$')).required(),
  phone: joi.string().pattern(new RegExp('^[0-9 ]{7,20}$')).required(),
  email: joi.string().email().required(),
  ssn: joi.string().min(3).required(),
  patient_id: joi.number().min(1).required(),
  id: joi.number().min(1).required(),
});

const schemaIdPatient = joi.object({
  patient_id: joi.number().min(1).required(),
});

module.exports = { schemaCreate, schemaId, schemaUpdate, schemaIdPatient}