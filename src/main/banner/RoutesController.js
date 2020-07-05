const Banner = require("./Schema");
const File = require("../../handler/File");
const Joi = require("@hapi/joi");
const { link } = require("@hapi/joi");

exports.create = async (req, res) => {
  let { sub1, sub2, color, btnColor, btnBackground, btnText, status, link, rank } = req.body;
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
  payload.sub1 = sub1;
  payload.sub2 = sub2;
  payload.rank = rank;
  payload.link = link;
  payload.color = color;
  payload.btnColor = btnColor;
  payload.btnBackground = btnBackground;
  payload.btnText = btnText;
  payload.profile = profile;
  payload.status = status;
  let banner = new Banner(payload);
  banner = await banner.save();
  res.json(banner);
};

exports.list = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Banner.list(query, { start, limit });
  res.json(list);
};

exports.all = async (req, res) => {
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Banner.list({ status: "active" }, { start, limit });
  res.json(list);
};

exports.get = async (req, res) => {
  let banner = await Banner.findById(req.params.id);
  res.json(banner);
};

exports.update = async (req, res) => {
  let banner = await Banner.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(banner);
};

exports.remove = async (req, res) => {
  let banner = await Banner.findByIdAndRemove(req.params.id);
  res.json(banner);
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

  let banner = await Banner.findByIdAndUpdate(id, { profile }, { new: true });
  res.json(banner);
};

exports.validate = (req, res, next) => {
  const schema = Joi.object({
    sub1: Joi.string().min(3).max(50).required().label("must supply sub1(max=50)!"),
    sub2: Joi.string().min(5).max(100).required().label("must supply sub2 (max=100)"),
    link: Joi.string().required().label("must give link")
  });

  const result = schema.validate(req.body, {
    allowUnknown: true,
    abortEarly: false
  });

  if (result.error) {
    const error = result.error.details.map(err => err.context.label);
    res.status(400);
    res.json(error);
    return;
  } else {
    next();
  }
};
