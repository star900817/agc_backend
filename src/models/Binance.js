const mongoose = require("mongoose");

const binanceSchema = new mongoose.Schema(
  {
    title: { type: String },
    currency: { type: String },
    price: { type: Number, default: 0 },
    image: { type: String, default: null },
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
    productTag: {
      type: String,
    },
    giftCards: {
      type: mongoose.Schema.Types.Mixed,
    },    
    faceToken: {
      type: String,
    },    
    baseToken: {
      type: String,
    },
    isDualToken: {
      type: String,
    },
    minQty: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Binance", binanceSchema);
