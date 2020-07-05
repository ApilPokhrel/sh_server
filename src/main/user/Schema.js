"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

mongoose.Promise = global.Promise;
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
  name: {
    salutation: { type: String, trim: true, lowercase: true },
    first: { type: String, trim: true, lowercase: true },
    initials: { type: String, trim: true, lowercase: true },
    last: { type: String, trim: true, lowercase: true },
    suffix: { type: String, trim: true, lowercase: true }
  },
  profile: {
    url: { type: String, trim: true },
    img: { type: String, trim: true }
  },
  contact: [
    {
      type: { type: String, trim: true, lowercase: true },
      address: { type: String, trim: true, lowercase: true, required: false },
      is_verified: { type: Boolean, default: false }
    }
  ],
  password: { type: String, trim: true, required: false },
  is_verified: { type: Boolean, default: false },
  gender: { type: String, trim: true, lowercase: true },
  dob: Date,
  addresses: [{ type: ObjectId, ref: "Address" }],
  roles: [{ type: String }],
  status: { type: String, enum: ["active", "inactive", "pending"], default: "active" }
});

schema.pre("save", function (next) {
  try {
    var user = this;
    if (user.isModified("password")) {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) {
          return Promise.reject();
        }
        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) {
            return Promise.reject();
          }

          user.password = hash;
          next();
        });
      });
    } else {
      next();
    }
  } catch (err) {}
});

schema.methods.generateAuthToken = async function () {
  try {
    var user = this;
    const access = "auth";
    const token = await jwt.sign({ _id: user._id.toHexString(), access }, process.env.AUTH_SECRET, {
      expiresIn: process.env.AUTH_EXPIRE
    });
    user.tokens = [{ access, token }];
    return user.save();
  } catch (err) {
    console.log(err);
  }
};

schema.statics.findByToken = async function (token) {
  var User = this;

  let decoded;
  try {
    decoded = await jwt.verify(token, process.env.AUTH_SECRET);
  } catch (err) {
    return Promise.reject("Token not decoded");
  }

  return User.findOne({
    _id: decoded._id
  });
};

schema.statics.findByCredentials = async function (address, password) {
  var User = this;
  let query = { "contact.address": address };
  const user = await User.findOne(query);
  if (!user) {
    return Promise.reject({ message: "user not found", status: 400 });
  }

  const res = await bcrypt.compare(password, user.password);
  if (res) {
    return user;
  } else {
    return Promise.reject({ message: "Password did not matched", status: 400 });
  }
};

schema.methods.removeToken = function (token) {
  var user = this;
  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  });
};

schema.statics.list = function (query, { start, limit }) {
  var User = this;
  return new Promise((resolve, reject) => {
    User.aggregate([
      {
        $facet: {
          data: [
            { $match: query },
            {
              $skip: start
            },
            {
              $limit: limit
            }
          ],
          summary: [{ $group: { _id: null, count: { $sum: 1 } } }]
        }
      }
    ])
      .then(d => {
        if (d[0].summary.length > 0)
          resolve({
            total: d[0].summary[0].count,
            limit,
            start,
            data: d[0].data
          });
        else
          resolve({
            total: 0,
            limit,
            start,
            data: []
          });
      })
      .catch(e => reject(e));
  });
};

module.exports = mongoose.model("User", schema);
