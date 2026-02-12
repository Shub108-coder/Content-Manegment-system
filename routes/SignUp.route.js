const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.get("/page/SignUp", (req, res) => {
  res.render("pages/SignUp");
});

router.post("/user/registration", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const IfUserExsist = await usermodel.findOne({ email });

    if (IfUserExsist) {
      req.flash("error", "User already exists. Try another email.");
      return res.redirect("/page/SignUp");
    }

    const HashedPassword = await bcrypt.hash(password,10);

    const user = await usermodel.create({
      username,
      email,
      password: HashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "7d" },
    );

    // SET COOKIE
    res.cookie("auth", token, {
      httpOnly: true, 
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.flash("success", "User created successfully!");
    res.redirect("/");
  } catch (err) {
    req.flash("error", "Registration failed");
    res.redirect("/page/SignUp");
  }
});

module.exports = router;
