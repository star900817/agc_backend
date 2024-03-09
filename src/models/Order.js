const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPaymentSuccess: {
      type: Boolean,
      default: false,
    },
    isRedeemCodeShared: {
      type: Boolean,
      default: false,
    },
    grandTotal: {
      type: String,
    },
    orderId: {
      type: String,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Binance",
        },
        productType: {
          type: String,
          enum: ["bitaqty", "gifts", "binance"],
          default: "bitaqty",
          required: true,
        },
	collectionName: {type: String},
        quantity: {
          type: Number,
        },
      },
    ],
    webHookOrderData: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
