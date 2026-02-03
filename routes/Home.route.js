const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Login page
router.get("/page/Home", (req, res) => {
  res.render("pages/Home");
});

// Login authentication
router.post("/user/Home", async (req, res) => {

});

module.exports = router;