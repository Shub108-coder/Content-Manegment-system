const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.js");
const cloudinary = require("../config/cloudinary");
const Folder = require("../models/Folder.model");
const File = require("../models/FIle.model.js");

/* HOME PAGE - Fixed path */
router.get("/", async (req, res) => {  // ← "/" instead of "/pages/Home"
  try {
    const folders = await Folder.find().populate("files");
    res.render("pages/Home", { folders });
  } catch (error) {
    console.log(error);
    res.status(500).send("Home page error");
  }
});

/* CREATE FOLDER - Fixed redirect */
router.post("/create-folder", async (req, res) => {
  try {
    const { folderName } = req.body;
    if (!folderName) return res.redirect("/");  // ← Fixed redirect

    await Folder.create({ name: folderName });
    res.redirect("/");  // ← Fixed redirect
  } catch (error) {
    console.log(error);
    res.status(500).send("Create folder error");
  }
});

/* UPLOAD FILE - Perfect, just fix redirects */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { folderId } = req.body;
    const file = req.file;

    if (!file || !folderId) return res.redirect("/");  // ← Fixed

    // ... rest of your upload code (PERFECT!) ...
    res.redirect("/");  // ← Fixed
  } catch (error) {
    console.log(error);
    res.status(500).send("Upload error");
  }
});

/* DELETE FILE - Perfect, just fix redirect */
router.post("/delete/:id", async (req, res) => {
  try {
    // ... your delete code (PERFECT!) ...
    res.redirect("/");  // ← Fixed
  } catch (error) {
    console.log(error);
    res.status(500).send("Delete error");
  }
});

module.exports = router;
