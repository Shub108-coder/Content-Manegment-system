const express = require("express");
const router = express.Router();
const usermodel = require("../models/Users.models.js");
const jwt = require("jsonwebtoken");

// Add this above your router.post
router.get("/page/SignUp", (req, res) => {
  res.render("pages/SignUp");
});

router.post("/user/registration",async (req,res) =>{
  const { username, email, password } = req.body;

  try{
     const IfUserExsist = await usermodel.findOne({email});

  if(IfUserExsist){
   req.flash('error', 'User already exists. Try another email.');
   return res.redirect('/page/SignUp'); 
  }
  const user = await usermodel.create({
    username,
    email,
    password
  });

  const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    // SET COOKIE
    res.cookie("Auth", token, {
      httpOnly: true,   // cannot be accessed by JS
      secure: false,    // true only in HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


 req.flash('success', 'User created successfully!');
    res.redirect('/page/Home');
  }catch(err){
    req.flash('error', 'Registration failed: ' + err.message);
    res.redirect('/page/SignUp');
  }
});

module.exports = router;