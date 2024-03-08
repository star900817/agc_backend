const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    price: {
      type: String,
    },
    quantity: {
      type: Number,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
