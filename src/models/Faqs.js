const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    faqs: [
      {
        question: {
          type: String,
        },
        answer: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faqs", faqSchema);
