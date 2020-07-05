"use strict";
const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    name: { type: String, trim: true, lowercase: true },
    desc: { type: String, trim: true, lowercase: true },
    is_admin: { type: Boolean, default: false },
    expiry_date: Date,
    permissions: [String]
  },
  {
    timestamps: true
  }
);

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

module.exports = mongoose.model("Role", schema);
