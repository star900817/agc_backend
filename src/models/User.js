const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: { type: Date },
    statusOrResidenceNumber: {
      type: Number,
    },
    fullName: {
      type: String,
    },
    nationality: {
      type: Object,
    },
    auth: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "customer"],
      default: "user",
    },
    wishlistNum: {
      type: Number,
      default: 0,
    },
    cartNum: {
      type: Number,
      default: 0,
    },
    loginWithSocial: {
      type: Boolean,
      default: false,
    },
    userAccess: {
      type: [mongoose.Schema.Types.String],
    },
    wishlist: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "wishlist.itemType",
        },
        itemType: {
          type: String,
          enum: ["bitaqty", "gifts", "binance", "Binance"],
          default: "bitaqty",
          required: true,
        },
      },
    ],
    // wishlist: [],
    cart: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "cart.productType",
        },
        productType: {
          type: String,
          enum: ["bitaqty", "gifts", "binance", "Binance"],
          default: "bitaqty",
        },
        quantity: { type: Number },
	categoryName: { type: String },
	productDescription: { type: String },
	productDetails: {
	  type: Object
	}
      },
    ],

    totalQty: { type: Number, default: 0 },
    firstName: { type: String },
    lastName: { type: String },
    latestOTP: { type: String },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("wishlist.populatedItem", {
  ref: function (doc) {
    return doc.itemType; // Dynamic reference based on itemType
  },
  localField: "wishlist.item",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("User", UserSchema);
