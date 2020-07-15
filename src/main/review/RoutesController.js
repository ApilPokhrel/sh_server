const Review = require("./Schema");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.create = async (req, res) => {
  let { product, text, rating, status } = req.body;
  let review = await Review.findOneAndUpdate(
    { user: req.user._id, product: product },
    {
      user: req.user._id,
      product,
      text,
      rating,
      status
    },
    { upsert: true, new: true }
  );
  res.json(review);
};

exports.list = async (req, res) => {
  let query = req.query.q || {};
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Review.list(query, { start, limit });
  res.json(list);
};

exports.getAllByProducts = async (req, res) => {
  let query = { $and: [{ status: "active" }, { product: ObjectId(req.query.product) }] };
  let sort = { rating: -1 };
  let limit = parseInt(req.query.limit) || 100;
  let start = parseInt(req.query.start) || 0;
  let list = await Review.list(query, { start, limit }, sort);
  res.json(list);
};

exports.get = async (req, res) => {
  let review = await Review.findById(req.params.id).populate("user").populate("product");
  res.json(review);
};

exports.getByUserAndProduct = async (req, res) => {
  let review = await Review.findOne({ user: req.user._id, product: req.query.product }).populate(
    "user"
  );
  res.json(review);
};

exports.update = async (req, res) => {
  let review = await Review.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  res.json(review);
};

exports.remove = async (req, res) => {
  let review = await Review.findByIdAndRemove(req.params.id);
  res.json(review);
};

exports.validate = (req, res, next) => {
  const schema = Joi.object({
    product: Joi.string().required().label("must supply product"),
    rating: Joi.number().required().min(1).max(5),
    status: Joi.string().default("active")
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
