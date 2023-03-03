const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const passport = require("passport");

//Require the controller
const users = require("../controllers/users");

// C - Create new user - show form
router.get("/register", users.renderRegisterForm);

// C - Create new user - form submits to:
router.post("/register", users.registerNewUser);

// Login form
router.get("/login", users.renderLoginForm);

// Login form submits to:
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  users.postLogin
);

// Logout
router.get("/logout", users.logout);

module.exports = router;
