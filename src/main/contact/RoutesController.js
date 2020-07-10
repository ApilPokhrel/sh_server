const Contact = require("./Schema");
const Joi = require("@hapi/joi");

exports.create = async (req, res) => {
  let contact = new Contact(req.body);
  contact = await Contact.save();
  res.json(contact);
};

exports.list = async (req, res) => {
  let status = req.query.status;
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let query = {};
  if (status) {
    if (status == "active") {
      query = { status: "active" };
    }
    if (status == "inactive") {
      query = { status: "inactive" };
    }
  }
  let list = await Contact.list(query, { start, limit });
  res.json(list);
};

exports.get = async (req, res) => {
  let contact = await Contact.findById(req.params.id);
  res.json(contact);
};

exports.update = async (req, res) => {
  let contact = await Contact.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(contact);
};

exports.remove = async (req, res) => {
  let contact = await Contact.findByIdAndRemove(req.params.id);
  res.json(contact);
};

exports.validate = (req, res, next) => {
  const schema = Joi.object({
    from: Joi.string().required().label("must supply from!"),
    message: Joi.string().required().label("must supply message")
  });

  const result = schema.validate(req.body, {
    allowUnknown: true,
    abortEarly: false
  });

  if (result.error) {
    const error = result.error.details.map(err => err.context.label);
    res.status(400);
    res.json(error);
    res.end();
  } else {
    next();
  }
};
