const mongoose = require("mongoose");

const cmsImageSchema = new mongoose.Schema(
  {
    imageType: {
      type: String,
      enum: ["cardSlider", "partnerLogo"],
      default: "cardSlider",
    },
    imageURL: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CMS", cmsImageSchema);
