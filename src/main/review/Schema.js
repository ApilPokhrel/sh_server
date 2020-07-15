const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const schema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: "Must have user!"
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: "Must supply product!"
    },
    text: {
      type: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    status: { type: String, enum: ["active", "inactive"] }
  },
  {
    timestamps: true
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

schema.statics.list = function (query, { start, limit }, s) {
  var Review = this;
  let sort = { createdAt: -1 };
  if (s) sort = s;
  return new Promise((resolve, reject) => {
    Review.aggregate([
      {
        $facet: {
          data: [
            { $match: query },
            { $sort: sort },
            {
              $skip: start
            },
            {
              $limit: limit
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
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

module.exports = mongoose.model("Review", schema);
