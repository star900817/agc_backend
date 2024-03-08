const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
  name: {
    type: String,
  },  
  image: {
    type: String,
  },
  subCategories: {
    type: mongoose.Schema.Types.Mixed,
  }
});

module.exports = mongoose.model("categories", categoriesSchema);


