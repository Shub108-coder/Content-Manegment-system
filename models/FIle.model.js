const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: String,
  url: String,
  publicId: String,
  type: String,
  size: String,

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("File", fileSchema);