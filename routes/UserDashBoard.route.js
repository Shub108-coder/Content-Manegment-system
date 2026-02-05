const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/page/UserDashBoard", (req, res) => {
  res.render("pages/UserDashBoard",);
});

router.post("/user/DashBoard", async (req, res) => {
    
});

module.exports = router;