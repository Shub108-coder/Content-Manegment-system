const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: String,
  url: String,
  publicId: String,
  type: String, 
  size: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);