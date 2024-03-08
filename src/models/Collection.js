const mongoose = require("mongoose");

const collectionsSchema = new mongoose.Schema({
  name: {
    type: String,
  },  
});

module.exports = mongoose.model("collections", collectionsSchema );
