const Role = require("./RoleSchema");
const Joi = require("@hapi/joi");

exports.role = {
  create: async (req, res, next) => {
    let payload = req.body;
    let role = await Role.findOneAndUpdate(
      { name: payload.name },
      { $set: payload },
      { upsert: true, new: true }
    );
    res.json(role);
  },
  validate: async (req, res, next) => {
    const schema = Joi.object().keys({
      name: Joi.string().required().label("must supply role name!"),
      desc: Joi.string().required().label("must supply role description"),
      permissions: Joi.array().items(Joi.string().required()).label("must supply permissions")
    });

    const result = await schema.validate(req.body, {
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
  },

  list: async (req, res, next) => {
    let { value, type } = req.query;
    let start = parseInt(req.query.start);
    let limit = parseInt(req.query.limit);
    let query = {};
    if (eval(type) && eval(value)) query = { [type]: value };
    let list = await Role.list(query, { start, limit });
    res.json(list);
  },

  get: async (req, res, next) => {
    let role = await Role.findById(req.params.id);
    res.json(role);
  },

  update: async (req, res) => {
    let payload = req.body;
    let role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: payload.name, expiry_date: payload.expiry_date },
        $addToSet: { permissions: payload.permissions }
      },
      { new: true }
    );
    res.json(role);
  },
  delete: async (req, res, next) => {
    let role = await Role.findByIdAndRemove(req.params.id);
    res.json(role);
  },

  removePerms: async (req, res) => {
    let { permission } = req.body;
    let role = await Role.findOneAndUpdate(
      { name: req.params.name },
      { $pull: { permissions: permission } },
      { new: true }
    );
    res.json(role);
  }
};
