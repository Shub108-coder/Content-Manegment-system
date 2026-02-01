const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");

// Add this above your router.post
router.get("/page/LogIn", (req, res) => {
  res.render("pages/LogIn");
});

router.post("/user/Auhentication", async (req, res) => {
  const { username, email, password } = req.body;

  const UserAlreadyExsist = await usermodel.findOne({ email });

  if (UserAlreadyExsist) {
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "7d" },
    );

    // SET COOKIE
    res.cookie("Auth", token, {
      httpOnly: true, // cannot be accessed by JS
      secure: false, // true only in HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    req.flash("success", "Log in successfully!");
    res.redirect("/page/Home");
  }
  req.flash("error", "This email is not registred Please Sign up");
  return res.redirect("/page/SignUp");
});

module.exports = router;
