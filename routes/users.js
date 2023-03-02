const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const passport = require("passport");

//Require the model and schema
const User = require("../models/user");

// C - Create new user - show form
router.get("/register", (req, res) => {
  res.render("users/register");
});

// C - Create new user - form submits to:
router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
    });
    req.flash("success", "Welcome to Yelp Camp!!!");
    res.redirect("/campsites");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// Login form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// Login form submits to:
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back!`);
    const redirectUrl = req.session.returnTo || "/campsites";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've successfully logged out, see you again soon!");
    res.redirect("/campsites");
  });
});
module.exports = router;
