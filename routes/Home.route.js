  const express = require("express");
  const router = express.Router();

  const upload = require("../middlewares/upload.js");
  const cloudinary = require("../config/cloudinary");

  const Folder = require("../models/Folder.model");
  const File = require("../models/FIle.model.js");

  /* ===========================
    HOME PAGE
  =========================== */
  router.get("/page/Home", async (req, res) => {
    try {
      const folders = await Folder.find().populate("files");
      res.render("Home", { folders });
    } catch (error) {
      console.log(error);
      res.status(500).send("Home page error");
    }
  });

  /* ===========================
    CREATE FOLDER
  =========================== */
  router.post("/create-folder", async (req, res) => {
    try {
      const { folderName } = req.body;

      if (!folderName) return res.redirect("/home");

      await Folder.create({
        name: folderName,
      });

      res.redirect("/home");
    } catch (error) {
      console.log(error);
      res.status(500).send("Create folder error");
    }
  });

  /* ===========================
    UPLOAD FILE (IMAGE / VIDEO)
  =========================== */
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const { folderId } = req.body;
      const file = req.file;

      if (!file || !folderId) return res.redirect("/home");

      // detect image or video
      const isVideo = file.mimetype.startsWith("video");
      const resourceType = isVideo ? "video" : "image";

      // upload to cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: resourceType,
              folder: "CMS",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(file.buffer);
      });

      // save file metadata in DB
      const savedFile = await File.create({
        originalName: file.originalname,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: uploadResult.resource_type,
        size: Math.round(file.size / 1024) + " KB",
      });

      // attach file to folder
      const folder = await Folder.findById(folderId);
      folder.files.push(savedFile._id);
      await folder.save();

      res.redirect("/home");
    } catch (error) {
      console.log(error);
      res.status(500).send("Upload error");
    }
  });

  /* ===========================
    DELETE FILE
  =========================== */
  router.post("/delete/:id", async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) return res.redirect("/home");

      // delete from cloudinary
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.type,
      });

      // remove reference from folders
      await Folder.updateMany(
        { files: file._id },
        { $pull: { files: file._id } }
      );

      // delete file from DB
      await file.deleteOne();

      res.redirect("/home");
    } catch (error) {
      console.log(error);
      res.status(500).send("Delete error");
    }
  });

  module.exports = router;
