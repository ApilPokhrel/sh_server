const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    sub1: { type: String, trim: true, max: 50, required: true, unique: true },
    rank: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    profile: { url: String, name: String },
    color: { type: String, default: "#333", trim: true },
    btnColor: { type: String, default: "#fff", trim: true },
    btnBackground: { type: String, default: "#333", trim: true },
    btnText: { type: String, default: "shop now" },
    sub2: { type: String, trim: true, max: 100, required: true, unique: true },
    link: { type: String, required: true, trim: true }
  },
  {
    collection: "banners",
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
  var Banner = this;
  return new Promise((resolve, reject) => {
    Banner.aggregate([
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

module.exports = mongoose.model("Banner", schema);
