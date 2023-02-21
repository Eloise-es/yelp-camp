const Joi = require("Joi");

// Validation  of campsite data
module.exports.campsiteSchema = Joi.object({
  campsite: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required(),
    location: Joi.string().required(),
    img: Joi.string().required(),
  }).required(),
});
