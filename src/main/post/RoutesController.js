const Post = require("./Schema");
const File = require("../../handler/File");
const Joi = require("@hapi/joi");

exports.create = async (req, res) => {
  let { title, status, desc, rank } = req.body;
  let payload = {};
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  let f = req.files[0];
  let name = Date.now();
  let file = { url: process.env.AWS_URL, name: name.toString(), type: f.mimetype };
  File.uploadToS3(`${name}`, f.buffer, f.mimetype);
  payload.title = title;
  payload.desc = desc;
  payload.status = status;
  payload.rank = rank;
  payload.file = file;
  let post = new Post(payload);
  post = await post.save();
  res.json(post);
};

exports.list = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Post.list(query, { start, limit });
  res.json(list);
};

exports.all = async (req, res) => {
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Post.list({ status: "active" }, { start, limit });
  res.json(list);
};

exports.get = async (req, res) => {
  let post = await Post.findById(req.params.id);
  res.json(post);
};

exports.update = async (req, res) => {
  let post = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(post);
};

exports.remove = async (req, res) => {
  let post = await Post.findByIdAndRemove(req.params.id);
  res.json(post);
};

exports.updateFile = async (req, res) => {
  let id = req.params.id;
  if (!req.files || !req.files.length) {
    res.status(400);
    res.json(["must upload file!"]);
    return;
  }
  let f = req.files[0];
  let name = Date.now();
  let file = { url: process.env.AWS_URL, name: name.toString(), type: f.type };
  File.uploadToS3(`${name}`, f.buffer, f.mimetype);

  let post = await Post.findByIdAndUpdate(id, { file }, { new: true });
  res.json(post);
};

exports.validate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required().label("must supply title!"),
    desc: Joi.string().required().label("must supply description!")
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
