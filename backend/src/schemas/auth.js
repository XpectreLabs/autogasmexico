const joi = require('joi');

const schema = joi.object({
  username: joi.string().alphanum().min(3).required(),
  password: joi.string().min(3).required(),
});

module.exports = { schema }