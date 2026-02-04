const User = require("../models/Users.models");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth;
    if (!token) return res.redirect("/page/SignUp");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) return res.redirect("/page/SignUp");

    const user = await User.findById(decoded.userId);
    if (!user) return res.redirect("/page/SignUp");

    req.user = user;
    next();
  } catch (err) {
    return res.redirect("/page/SignUp");
  }
};

module.exports = authMiddleware;
