const Product = require("./Schema");
const File = require("../../handler/File");
const Joi = require("@hapi/joi");
const C = require("./Controller");

exports.add = async (req, res) => {
  let files = [];
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  for (let f of req.files) {
    let name = Date.now();
    files.push({ url: process.env.AWS_URL, name: name.toString(), type: f.mimetype });
    File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  }
  let payload = await payloadParser(req.body);
  payload.profile = files[0];
  files.shift();
  payload.files = files;
  let product = new Product(payload);
  product = await product.save();
  res.json(product); // Everything went fine.
};

let payloadParser = payload => {
  let keys = Object.keys(payload);
  for (let e of keys) {
    payload[e] = JSON.parse(payload[e]);
  }
  return payload;
};

exports.get = async (req, res) => {
  let product = await Product.findById(req.params.id);
  res.json(product);
};

exports.getBySlug = async (req, res) => {
  let product = await Product.findBySlug(req.params.slug);
  res.json(product);
};

exports.list = async (req, res) => {
  let start = parseInt(req.query.start) || 0;
  let limit = parseInt(req.query.limit) || 100;
  let product = await Product.list({}, { start, limit });
  res.json(product);
};

exports.all = async (req, res) => {
  let start = parseInt(req.query.start) || 0;
  let limit = parseInt(req.query.limit) || 10;
  let product = await Product.list({ status: "active" }, { start, limit });
  res.json(product);
};

exports.filter = async (req, res) => {
  let start = parseInt(req.query.start) || 0;
  let limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort;
  let price = req.query.price;
  let color = req.query.color;
  let tags = req.query.tags;
  let { sorts, matches } = await C.parseFilter({ sort, price, color, tags });
  let product = await Product.getAll(req.query.c, { start, limit, sorts, matches });
  res.json(product);
};

exports.update = async (req, res) => {
  let product = await Product.findByIdAndUpdate(req.params.id, req.body);
  res.json(product);
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
  let profile = { url: process.env.AWS_URL, name: name.toString(), type: f.mimetype };
  File.uploadToS3(`${name}`, f.buffer, f.mimetype);

  let product = await Product.findByIdAndUpdate(id, { profile }, { new: true });
  res.json(product);
};

exports.updateFiles = async (req, res) => {
  let id = req.params.id;
  let files = [];
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  for (let f of req.files) {
    let name = Date.now();
    files.push({ url: process.env.AWS_URL, name: name.toString(), type: f.mimetype });
    File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  }

  let product = await Product.findByIdAndUpdate(id, { files }, { new: true });
  res.json(product);

  //Deleting one file becomes difficult
  //So store in different database
};

exports.remove = async (req, res) => {
  let product = await Product.findByIdAndRemove(req.params.id);
  res.json(product);
};

exports.upload = (req, res) => {};

exports.addChoices = (req, res) => {};

exports.validate = async (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required().label("must supply  name!"),
    desc: Joi.string().required().label("must supply Description!"),
    min: Joi.number().required().label("must supply min!"),
    price: Joi.number().required().label("must supply price!"),
    priceUnit: Joi.string().required().label("must supply  price unit eg(USD, NPL, INR)!"), //US, NRS, INR
    is_available: Joi.boolean().required().label("must supply  product available or not!")
  });

  const result = await schema.validate(req.body, {
    allowUnknown: true,
    abortEarly: false
  });

  if (result.error) {
    const error = result.error.details.map(err => err.context.label);
    res.status(400);
    console.log(error);
    res.json(error);
    res.end();
  } else {
    next();
  }
};
