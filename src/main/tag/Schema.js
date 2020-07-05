const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    name: { type: String, trim: true, max: 50, required: true, unique: true, lowercase: true },
    total: { type: Number },
    index: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    desc: String
  },
  {
    collection: "tags",
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
  var Tag = this;
  return new Promise((resolve, reject) => {
    Tag.aggregate([
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

module.exports = mongoose.model("Tag", schema);
