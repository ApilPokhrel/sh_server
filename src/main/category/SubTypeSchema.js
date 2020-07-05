const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    name: { type: String, trim: true, max: 50, required: true, unique: true },
    total: { type: Number },
    index: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    profile: { url: String, name: String },
    desc: String
    // type: { type: mongoose.Schema.Types.ObjectId, ref: "Type", required: true }
  },
  {
    collection: "subtypes",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

schema.statics.getOne = function (query) {
  var SubType = this;
  return new Promise((resolve, reject) => {
    SubType.aggregate([
      {
        $match: query
      },
      {
        $limit: 1
      }
    ])
      .then(d => {
        d.length ? resolve(d[0]) : resolve({});
      })
      .catch(err => reject(err));
  });
};

schema.statics.list = function (query, { start, limit }) {
  var SubType = this;
  return new Promise((resolve, reject) => {
    SubType.aggregate([
      {
        $facet: {
          data: [
            { $match: query },
            {
              $skip: start
            },
            {
              $limit: limit
            },
            { $sort: { index: 1 } }
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

module.exports = mongoose.model("SubType", schema);
