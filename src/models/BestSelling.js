const mongoose = require("mongoose");

// Combined schema for the array of objects with embedded reference
const bestSellingSchema = new mongoose.Schema({
  bestSelling: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bitaqty", // Reference to the Bitaqty model
        required: true,
      },
      purchaseCount: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("BestSelling", bestSellingSchema);
