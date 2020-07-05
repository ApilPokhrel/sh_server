const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    //category -> { tags -> types } -> product
    name: { type: String, trim: true, max: 50, required: true, unique: true },
    slug: { type: String, trim: true, unique: true },
    score: { type: Number, required: true },
    status: { type: String, required: true },
    // sub: [String], //type subs
    desc: { type: String, trim: true, min: 50, required: true },
    files: [{ url: String, name: String, type: { type: String } }],
    // type:[String], //category types//like for machinary machines small tools little hardware
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    extras: {}
  },
  {
    collection: "categories",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

schema.pre("save", function(next) {
  var category = this;
  if (category.isModified("name")) {
    category.slug = category.name.toLowerCase();
  }
  next();
});

schema.statics.list = async function(query, { start, limit }) {
  var Category = this;
  return new Promise((resolve, reject) => {
    Category.aggregate([
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

module.exports = mongoose.model("Category", schema);
