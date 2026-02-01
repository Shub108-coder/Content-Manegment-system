const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDb = require("./db/ConectDb.js");
const SignUpRoute = require("./routes/SignUp.route.js");
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const cookieParser = require("cookie-parser");

dotenv.config();


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
// ✅ CORRECT ORDER:
app.use(express.urlencoded({ extended: true }));  // FIRST
app.use(express.json());         // SECOND

app.use(express.static('public'));

// Sessions AFTER body parsing
app.use(session({
  secret: process.env.SESSION_KEY || "mySecretKey",
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

// Flash locals LAST
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.error = req.flash('error');
  next();
});

// Static files (add this)
app.use(express.static('public'));

// Routes
app.use("/", SignUpRoute);

module.exports = app;
