const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true
    },

    url: {
      type: String,
      required: true
    },

    publicId: {
      type: String,
      required: true
    },

    type: {
      type: String, // image / video / pdf
      required: true
    },

    size: {
      type: Number // size in KB
    },

    originalName: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("File", fileSchema);