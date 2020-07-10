const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    title: { type: String, trim: true, max: 50, required: true, unique: true },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    file: { type: { type: String }, url: String, name: String },
    rank: { type: Number, default: 0 },
    desc: String
  },
  {
    collection: "posts",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

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
            { $sort: { rank: -1 } }
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

module.exports = mongoose.model("Post", schema);
