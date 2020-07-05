const Tag = require("./Schema");
const Joi = require("@hapi/joi");

exports.create = async (req, res) => {
  let tag = new Tag(req.body);
  tag = await tag.save();
  res.json(tag);
};

exports.list = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Tag.list(query, { start, limit });
  res.json(list);
};

exports.get = async (req, res) => {
  let tag = await Tag.findById(req.params.id);
  res.json(tag);
};

exports.update = async (req, res) => {
  let tag = await Tag.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(tag);
};

exports.remove = async (req, res) => {
  let tag = await Tag.findByIdAndRemove(req.params.id);
  res.json(tag);
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
