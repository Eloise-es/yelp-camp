const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const passport = require("passport");

//Require the controller
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegisterForm)
  .post(users.registerNewUser);

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      keepSessionInfo: true,
    }),
    users.postLogin
  );

router.get("/logout", users.logout);

module.exports = router;
