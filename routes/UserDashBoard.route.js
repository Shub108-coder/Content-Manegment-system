const express = require("express");
const router = express.Router();
const User = require("../models/Users.models");
const jwt = require("jsonwebtoken");

/* ================= USER DASHBOARD PAGE ================= */
router.get("/page/UserDashBoard", async (req, res) => {
  try {
    const token = req.cookies?.auth;
    if (!token) {
      console.log("❌ No auth cookie");
      return res.redirect("/page/Login");
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

   
    const userId = decoded.userId || decoded.id;
    if (!userId) {
    
      return res.redirect("/page/Login");
    }

    const user = await User.findById(userId);
    if (!user) {
      
      return res.redirect("/page/Login");
    }

    res.render("pages/UserDashBoard", { user });

  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.clearCookie("auth");
    res.redirect("/page/Login");
  }
});

/* ================= LOGOUT ================= */
router.post("/logout", (req, res) => {
  res.clearCookie("auth");
  res.redirect("/page/Login");
});


module.exports = router;

