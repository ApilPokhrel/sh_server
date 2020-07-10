const AuthToken = require("../../util/AuthToken");
const User = require("./Schema");
const NameParser = require("../../util/NameParser");
const Joi = require("@hapi/joi");
const CC = require("../common/Controller");
const C = require("./Controller");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findByCredentials(username, password);
  if (!user.is_verified) {
    C.sendMail({ to: username, user_id: user._id });
  }
  const accessToken = await AuthToken.generateAccessToken(user);
  res.json({ user, accessToken });
};

exports.verifyCode = async (req, res) => {
  const { code } = req.body;
  await C.verifyCode(code);
  await C.updateRedis(req.user._id);
  let user = await User.findOneAndUpdate(
    { _id: req.user_id, "contact.address": "email" },
    { $set: { "contact.$.is_verified": true, is_verified: true } },
    { new: true }
  );
  res.json(user);
};

exports.sendCode = async (req, res) => {
  const code = await C.generateCode(req.user._id);
  res.json(code);
};

exports.register = async (req, res) => {
  let { name, email, password, gender, phone, address, roles } = req.body;
  let payload = {};
  const emailUser = await User.findOne({ "contact.address": email });
  if (emailUser) {
    res.status(400);
    res.json({ message: "Email already taken" });
    return;
  }

  payload.name = await NameParser.parse(name);
  payload.contact = [{ address: email, type: "email" }];
  if (phone) payload.contact.push({ address: phone, type: "phone" });
  payload.password = password;
  if (gender) payload.gender = gender;
  if (roles) user.roles = roles;

  let user = new User(payload);
  if (address) {
    let address = await CC.addAddress(address);
    user.addresses.push(address._id);
  }

  const accessToken = AuthToken.generateAccessToken(user);

  user = await user.save();
  C.sendMail({ to: email, user_id: user._id });
  res.json({ user, accessToken });
};

exports.get = async (req, res) => {
  let user = await User.findById(req.params.id).populate("addresses");
  res.json(user);
};

exports.getByContact = async (req, res) => {
  let query = { "contact.address": req.params.address };
  const user = await User.findOne(query);
  res.json(user);
};

exports.list = async (req, res) => {
  let { value, type } = req.query;
  let start = parseInt(req.query.start);
  let limit = parseInt(req.query.limit);
  let query = {};
  if (eval(type) && eval(value)) query = { [type]: value };
  let users = await User.list(query, { start, limit });
  res.json(users);
};

exports.edit = async (req, res) => {
  let { name, email, phone, roles, dob, email_verified, phone_verified, is_verified } = req.body;
  let payload = {};
  let contact = [];
  if (name) payload.name = await NameParser.parse(name);
  if (email) contact.push({ address: email, type: "email", is_verified: email_verified });
  if (phone) contact.push({ address: phone, type: "phone", is_verified: phone_verified });
  if (email && phone) payload.contact = contact;
  if (dob) payload.dob = dob;
  if (roles && roles.length) payload.roles = roles;
  if (is_verified) payload.is_verified = is_verified;

  let user = await User.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
  res.json(user);
};

exports.delete = async (req, res) => {
  let user = await User.findByIdAndRemove(req.params.id);
  res.json(user);
};

exports.validateLogin = async (req, res, next) => {
  const schema = Joi.object().keys({
    username: Joi.string().required().label("must supply email or phone address!"),
    password: Joi.string().required().label("must supply password")
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
};

exports.validateRegister = async (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required().label("must supply full name!"),
    email: Joi.string().required().label("must supply email address"),
    password: Joi.string().required().min(6).label("password must be at least 6 character"),
    // address: CC.validateAddress(),
    phone: Joi.string().required().label("must supply Phone number")
    // gender: Joi.string().required().label("must supply your Gender!")
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
};
