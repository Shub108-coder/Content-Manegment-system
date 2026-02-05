const jwt = require("jsonwebtoken");
const User = require("../models/Users.models");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.auth;

  if (!token) {
    return res.redirect("/page/SignUp");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Fetch FULL user from DB (THIS IS THE KEY FIX)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.clearCookie("auth");
      return res.redirect("/page/SignUp");
    }

    req.user = user;

    next();
  } catch (error) {
    res.clearCookie("auth");
    return res.redirect("/page/SignUp");
  }
};

module.exports = authMiddleware;
