const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");
const Folder = require("../models/Folder.model");
const File = require("../models/FIle.model");

/* =========================== HOME PAGE =========================== */
router.get("/", async (req, res) => {
    try {
        // Fetch folders and populate files so they show up in the table
        const folders = await Folder.find().populate("files");
        res.render("pages/Home", { folders });
    } catch (error) {
        console.error("Home Route Error:", error);
        res.status(500).send("Error loading dashboard");
    }
});

/* =========================== CREATE FOLDER =========================== */
router.post("/create-folder", async (req, res) => {
    try {
        const { folderName } = req.body;
        if (!folderName) return res.redirect("/");
        
        await Folder.create({ name: folderName });
        res.redirect("/"); // Redirect to the main page
    } catch (error) {
        console.error("Create Folder Error:", error);
        res.status(500).send("Could not create folder");
    }
});

/* =========================== UPLOAD FILE =========================== */
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { folderId } = req.body;
        const file = req.file;
        if (!file || !folderId) return res.redirect("/");

        const isVideo = file.mimetype.startsWith("video");
        
        // Cloudinary upload logic
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

        // Save file record
        const savedFile = await File.create({
            originalName: file.originalname,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            type: isVideo ? "video" : "image",
            size: Math.round(file.size / 1024) + " KB",
        });

        // Add file reference to the folder
        await Folder.findByIdAndUpdate(folderId, {
            $push: { files: savedFile._id }
        });

        res.redirect("/");
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).send("Upload failed");
    }
});

/* =========================== DELETE FILE =========================== */
router.post("/delete/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.redirect("/");

        // Remove from Cloudinary first
        await cloudinary.uploader.destroy(file.publicId, { resource_type: file.type });

        // Clean up database references
        await Folder.updateMany({ files: file._id }, { $pull: { files: file._id } });
        await file.deleteOne();

        res.redirect("/");
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).send("Delete failed");
    }
});

module.exports = router;