const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    from: { type: String, trim: true, max: 50, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
    message: String
  },
  {
    collection: "contacts",
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
  var Contact = this;
  return new Promise((resolve, reject) => {
    Contact.aggregate([
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

module.exports = mongoose.model("Contact", schema);
