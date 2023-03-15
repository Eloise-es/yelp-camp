//Require the model
const User = require("../models/user");

module.exports.registerNewUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Yelp Camp, ${username}!!!`);
      res.redirect("/campsites");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.postLogin = (req, res) => {
  req.flash("success", `Welcome back!`);
  const redirectUrl = req.session.returnTo || "/campsites";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've successfully logged out, see you again soon!");
    res.redirect("/");
  });
};
