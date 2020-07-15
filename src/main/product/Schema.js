const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
//chair, window
const schema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    slug: { type: String, trim: true },
    condition: { type: String },
    desc: { type: String, trim: true },
    sub_type: { type: mongoose.Schema.Types.ObjectId, ref: "SubType", required: true },
    profile: { url: String, name: String },
    files: [
      {
        url: String,
        name: String,
        type: { type: String },
        index: { type: Number, default: 0 }
      }
    ],
    price: Number, // unit price
    price_unit: { type: String, default: "normal" },
    currency: { type: String, enum: ["npr", "inr", "usd"] },
    discount: Number, //in percentage

    min: { type: Number, default: 1 },
    max: { type: Number, default: 100 },
    is_available: { type: Boolean, default: false },
    is_discount: { type: Boolean, default: false },
    colors: [
      { name: { type: String, lowercase: true, trim: true }, value: { type: String, trim: true } }
    ],
    units: [
      {
        name: { type: String, lowercase: true, trim: true },
        value: Number,
        standard: { type: String, lowercase: true, trim: true }
      }
    ],
    features: [String],
    specs: [
      {
        key: { type: String, lowercase: true, trim: true },
        value: { type: mongoose.Schema.Types.Mixed, lowercase: true, trim: true },
        rank: Number
      }
    ],
    tag: [{ type: String, lowercase: true, trim: true }],
    status: {
      type: String,
      enum: ["active", "pending", "inactive", "disabled"],
      default: "active"
    }, //active: ok, pending: needs to be approved by super admin, inactive:  cannot show product but can be recovered, disabled: cannot be recovered
    extras: {}
  },
  {
    collection: "products",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

schema.pre("save", function (next) {
  var product = this;
  if (product.isModified("name")) {
    let slug = product.name.split(" ").join("_");
    product.slug = `${slug}_${Date.now()}`;
  }
  next();
});

schema.statics.list = function (q, { start, limit }) {
  var Product = this;

  return new Promise((resolve, reject) => {
    Product.aggregate([
      {
        $facet: {
          data: [
            { $match: q },
            { $sort: { createdAt: -1 } },
            { $skip: start },
            { $limit: limit },
            {
              $lookup: {
                from: "subtypes",
                localField: "sub_type",
                foreignField: "_id",
                as: "sub_type"
              }
            },
            {
              $unwind: {
                path: "$sub_type",
                preserveNullAndEmptyArrays: true
              }
            }
          ],
          summary: [{ $match: q }, { $group: { _id: null, count: { $sum: 1 } } }]
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

schema.statics.getAll = function (category, { start, limit, sorts, matches }) {
  var Product = this;

  return new Promise((resolve, reject) => {
    Product.aggregate([
      {
        $facet: {
          data: [
            { $match: { status: "active" } },
            {
              $lookup: {
                from: "subtypes",
                localField: "sub_type",
                foreignField: "_id",
                as: "sub_type"
              }
            },
            {
              $unwind: {
                path: "$sub_type",
                preserveNullAndEmptyArrays: true
              }
            },
            { $match: { "sub_type._id": ObjectId(category) } },
            {
              $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "product",
                as: "reviews"
              }
            },
            {
              $project: {
                reviewCount: { $sum: "$reviews" },
                averageReview: { $avg: "$reviews.rating" },
                document: "$$ROOT"
              }
            },
            ...matches,
            ...sorts,
            { $skip: start },
            { $limit: limit }
          ],
          summary: [
            { $match: { status: "active" } },
            {
              $lookup: {
                from: "subtypes",
                localField: "sub_type",
                foreignField: "_id",
                as: "sub_type"
              }
            },
            {
              $unwind: {
                path: "$sub_type",
                preserveNullAndEmptyArrays: true
              }
            },
            { $match: { "sub_type._id": ObjectId(category) } },
            {
              $project: {
                reviewCount: { $sum: "$reviews" },
                averageReview: { $avg: "$reviews.rating" },
                document: "$$ROOT"
              }
            },
            ...matches,
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
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

schema.statics.findBySlug = function (slug) {
  let Product = this;
  return new Promise((resolve, reject) => {
    Product.aggregate([
      { $match: { slug } },
      { $limit: 1 },
      {
        $lookup: {
          from: "subtypes",
          localField: "sub_type",
          foreignField: "_id",
          as: "sub_type"
        }
      },
      {
        $unwind: {
          path: "$sub_type",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews"
        }
      },
      {
        $project: {
          reviewCount: { $sum: "$reviews" },
          averageReview: { $avg: "$reviews.rating" },
          document: "$$ROOT"
        }
      }
    ])
      .then(d => {
        if (d.length) resolve(d[0]);
        else resolve({});
      })
      .catch(e => reject(e));
  });
};

schema.statics.getByReview = function () {
  return this.aggregate([
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "reviews"
      }
    },
    {
      $match: { "reviews.1": { $exists: true } }
    },
    {
      $project: {
        count: { $sum: "$reviews" },
        average: { $avg: "$reviews.rating" }
      }
    },
    {
      $sort: { average: -1 }
    },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model("Product", schema);
