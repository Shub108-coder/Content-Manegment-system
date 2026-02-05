const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

const Folder = require("../models/Folder.model");
const File = require("../models/FIle.model");
const User = require("../models/Users.models");

const authMiddleware = require("../middlewares/auth.middleware");

/* =========================== HOME PAGE =========================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const folders = await Folder
      .find({ owner: req.user._id })
      .populate("files");

    res.render("pages/Home", { folders });
  } catch (error) {
    console.error("Home Route Error:", error);
    res.status(500).send("Error loading dashboard");
  }
});

/* =========================== CREATE FOLDER =========================== */
router.post("/create-folder", authMiddleware, async (req, res) => {
  try {
    const { folderName } = req.body;
    if (!folderName) return res.redirect("/");

    // Create folder
    const folder = await Folder.create({
      name: folderName,
      owner: req.user._id,
    });

    // Update user (reference + counter)
    await User.findByIdAndUpdate(req.user._id, {
      $push: { folders: folder._id },
      $inc: { foldersCount: 1 },
    });

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Could not create folder");
  }
});

/* =========================== UPLOAD FILE =========================== */
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { folderId } = req.body;
      const file = req.file;

      if (!file || !folderId) return res.redirect("/");

      const isVideo = file.mimetype.startsWith("video");

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "CMS" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      // Create file document
      const savedFile = await File.create({
        originalName: file.originalname,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: isVideo ? "video" : "image",
        size: Math.round(file.size / 1024) + " KB",
        owner: req.user._id,
      });

      // Push file into folder
      await Folder.findOneAndUpdate(
        { _id: folderId, owner: req.user._id },
        { $push: { files: savedFile._id } }
      );

      // Update user 
      await User.findByIdAndUpdate(req.user._id, {
        $push: { files: savedFile._id },
        $inc: { filesCount: 1 },
      });

      res.redirect("/");
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).send("Upload failed");
    }
  }
);

/* =========================== DELETE FILE =========================== */
router.post("/delete/:id", authMiddleware, async (req, res) => {
  try {
    // Find file owned by user
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) return res.redirect("/");

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: file.type,
    });

    // Remove file from folders
    const folders = await Folder.find({
      files: file._id,
      owner: req.user._id,
    });

    for (const folder of folders) {
      folder.files.pull(file._id);
      await folder.save();

      // If folder empty > delete folder + update user count
      if (folder.files.length === 0) {
        await Folder.findByIdAndDelete(folder._id);

        await User.findByIdAndUpdate(req.user._id, {
          $pull: { folders: folder._id },
          $inc: { foldersCount: -1 },
        });
      }
    }

    // Update user 
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { files: file._id },
      $inc: { filesCount: -1 },
    });

    // Delete file document
    await file.deleteOne();

    res.redirect("/");
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send("Delete failed");
  }
});

module.exports = router;
