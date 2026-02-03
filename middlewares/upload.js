const multer = require("multer");

// use memory storage so multer doesn't save to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
