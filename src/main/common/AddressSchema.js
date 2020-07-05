const mongoose = require("mongoose");
const schema = mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [Number]
    },

    address1: {
      type: String
    },
    address2: {
      type: String
    },
    state: { type: String, trim: true },
    country: { type: String, trim: true, lowercase: true, required: false },
    code: { type: String, trim: true, lowercase: true, required: false },
    postcode: { type: String, trim: true, lowercase: true, required: false },
    city: { type: String, trim: true, lowercase: true, required: false }
  },
  {
    collection: "addresses",
    timestamps: true,
    toObject: {
      virtuals: true
    },
    toJson: {
      virtuals: true
    }
  }
);

module.exports = mongoose.model("Address", schema);
