const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    name: { type: String, trim: true, max: 50, required: true, unique: true },
    total: { type: Number },
    score: { type: Number },
    status: { type: String },
    desc: String,
    files: [{ url: String, name: String, type: { type: String } }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
  },
  {
    collection: "types",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

schema.statics.list = async function(query, { start, limit }) {
  var Type = this;
  return new Promise((resolve, reject) => {
    Type.aggregate([
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
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
              }
            },
            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
              }
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

module.exports = mongoose.model("Type", schema);
