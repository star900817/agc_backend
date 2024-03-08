const mongoose = require("mongoose");

const copmaniesSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("companies", copmaniesSchema);
