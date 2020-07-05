const Category = require("./Schema");
const Type = require("./TypeSchema");
const SubType = require("./SubTypeSchema");
const File = require("../../handler/File");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//TODO Category
exports.createCategory = async (req, res) => {
  let category = new Category(req.body);
  category = await category.save();
  res.json(category);
};

exports.getCategory = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug });
  res.json(category);
};

exports.updateCategory = async (req, res) => {
  delete req.body.files;
  req.body.slug = req.body.name.toLowerCase();
  let category = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: req.body },
    { new: true }
  );
  res.json(category);
};

exports.removeCategoryFile = async (req, res) => {
  let category = await Category.findByIdAndUpdate(
    req.params.id,
    { $pull: { files: { _id: req.body._id } } },
    { new: true }
  );
  res.json(category);
};

exports.uploadCategoryFiles = async (req, res) => {
  let files = [];
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload files"]);
    return;
  }

  for (let f of req.files) {
    let name = Date.now();
    files.push({ url: process.env.AWS_URL, name, type: f.mimetype });
    await File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  }

  let category = await Category.findOneAndUpdate(
    { slug: req.params.slug },
    { $addToSet: { files } },
    { new: true }
  );
  res.json(category);
};

exports.validateCategory = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().label("must supply name!"),
    desc: Joi.string().required().label("must supply category description"),
    score: Joi.number().required().label("must supply score number"),
    status: Joi.string().required().label("must give status")
  });

  let files = [];
  if (req.body.files && req.body.files.length) {
    for (let f of req.body.files) {
      if (f.url) files.push(f);
    }
  }
  req.body.files = files;

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

exports.removeCategory = async (req, res) => {
  let category = await Category.findByIdAndDelete(req.params.id);
  res.json(category);
};

exports.listCategory = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Category.list(query, { start, limit });
  res.json(list);
};

//TODO type
exports.createCategoryType = async (req, res) => {
  let type = new Type(req.body);
  type = await type.save();
  res.json(type);
};

exports.listCategoryType = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Type.list(query, { start, limit });
  res.json(list);
};

exports.getCategoryType = async (req, res) => {
  let type = await Type.findById(req.params.id).populate("category");
  res.json(type);
};

exports.updateCategoryType = async (req, res) => {
  delete req.body.files;
  let type = await Type.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(type);
};

exports.removeCategoryType = async (req, res) => {
  let type = await Type.findByIdAndRemove(req.params.id);
  res.json(type);
};

exports.getByCategory = async (req, res) => {
  let types = await Type.find({ category: req.params.category });
  res.json(types);
};

exports.uploadTypeFiles = async (req, res) => {
  let files = [];
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload files"]);
    return;
  }

  for (let f of req.files) {
    let name = Date.now();
    files.push({ url: process.env.AWS_URL, name, type: f.mimetype });
    await File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  }

  let type = await Type.findByIdAndUpdate(req.params.id, { $addToSet: { files } }, { new: true });
  res.json(type);
};

exports.removeTypeFile = async (req, res) => {
  let type = await Type.findByIdAndUpdate(
    req.params.id,
    { $pull: { files: { _id: req.body._id } } },
    { new: true }
  );
  res.json(type);
};

exports.validateCategoryType = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().label("must supply name!"),
    desc: Joi.string().required().label("must supply category description"),
    score: Joi.number().required().label("must supply score number"),
    status: Joi.string().required().label("must give status"),
    category: Joi.string().required().min(5).label("must give category")
  });

  let files = [];
  if (req.body.files && req.body.files.length) {
    for (let f of req.body.files) {
      if (f.url) files.push(f);
    }
  }
  req.body.files = files;

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

//TODO sub type
exports.createCategorySubType = async (req, res) => {
  let payload = {};
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  let f = req.files[0];
  let name = Date.now();
  let profile = { url: process.env.AWS_URL, name: name.toString() };
  File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  payload.name = req.body.name;
  payload.desc = req.body.desc;
  payload.profile = profile;
  payload.status = req.body.status;
  let subType = new SubType(payload);
  subType = await subType.save();
  res.json(subType);
};

exports.listCategorySubType = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await SubType.list(query, { start, limit });
  res.json(list);
};

exports.all = async (req, res) => {
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await SubType.list({ status: "active" }, { start, limit });
  res.json(list);
};

exports.getCategorySubType = async (req, res) => {
  let subType = await SubType.findById(req.params.id);
  res.json(subType);
};

exports.updateCategorySubType = async (req, res) => {
  let subType = await SubType.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(subType);
};

exports.removeCategorySubType = async (req, res) => {
  let subType = await SubType.findByIdAndRemove(req.params.id);
  res.json(subType);
};

exports.updateProfile = async (req, res) => {
  let id = req.params.id;
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  let f = req.files[0];
  let name = Date.now();
  let profile = { url: process.env.AWS_URL, name: name.toString() };
  File.uploadToS3(`${name}`, f.buffer, f.mimetype);

  let subtype = await SubType.findByIdAndUpdate(id, { profile }, { new: true });
  res.json(subtype);
};

exports.validateSubType = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().label("must supply name!"),
    desc: Joi.string().required().label("must supply category description"),
    status: Joi.string().required().label("must give status")
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
