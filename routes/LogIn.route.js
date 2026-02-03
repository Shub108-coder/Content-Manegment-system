const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Login page
router.get("/page/LogIn", (req, res) => {
  res.render("pages/LogIn");
});

// Login authentication
router.post("/user/Auhentication", async (req, res) => {
  try {
    let { email, password } = req.body;

    // find user by email
    const user = await usermodel.findOne({ email });

    if (!user) {
      req.flash("error", "Email is not registred please sign up");
      return res.redirect("/page/LogIn");
    }

    //  compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.flash("error", "Wrong password");
      return res.redirect("/page/LogIn");
    }

    //  generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    // 4️⃣ set cookie
    res.cookie("Auth", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.flash("success", "Log in successfully!");
    return res.redirect("/page/Home");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/page/LogIn");
  }
});

module.exports = router;
