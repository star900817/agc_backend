const mongoose = require("mongoose");

const bitaqtySchema = new mongoose.Schema(
  {
    productDetails: { type: Object },
    price: { type: Number, default: 0 },
    image: { type: String, default: null },
    productCollection: {
      type: String,
    },
    colection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collections",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    subCategory: {
      type: String,
    },
    priceInSAR: {
      type: Number,
    },
    description: {
	type: String,	
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bitaqty", bitaqtySchema);
