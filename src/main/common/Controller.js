const Joi = require("@hapi/joi");
const Address = require("./AddressSchema");

exports.validateAddress = () => {
  return Joi.object()
    .keys({
      // state: Joi.string()
      //   .required()
      //   .label("must supply state name!"),

      country: Joi.string()
        .required()
        .label("must supply country name!"),

      // city: Joi.string()
      //   .required()
      //   .label("must supply city name!"),

      // postcode: Joi.string()
      //   .required()
      //   .label("must supply postal code or zipcode!"),

      code: Joi.string()
        .required()
        .label("must supply phone number code!")

      // address1: Joi.string()
      //   .required()
      //   .min(4)
      //   .label("must supply valid address1!")
    })
    .required()
    .label("Address is required");
};

exports.addAddress = payload => {
  let address = new Address(payload);
  return address.save();
};
