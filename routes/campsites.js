// Require the modules
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

//Require the model
const Campsite = require("../models/campsite");

// Middleware (functions) for these routes
const { isLoggedIn, isAuthor, validateCampsite } = require("../middleware");

// R - View all campsites index
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campsites = await Campsite.find({});
    res.render("campsites/index", { campsites });
  })
);

// R - Show details page for specific campsite
router.get(
  "/details/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id)
      .populate("reviews")
      .populate("author");
    console.log(campsite);
    if (!campsite) {
      req.flash("error", "Can't find that campsite!");
      res.redirect("/campsites");
    } else {
      res.render("campsites/details", { campsite });
    }
  })
);

// C - Render the form to add new campsite
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campsites/new");
});

// C - Form post request to add new campsite
router.post(
  "/",
  isLoggedIn,
  validateCampsite,
  catchAsync(async (req, res) => {
    const camp = new Campsite(req.body.campsite);
    camp.author = req.user.id;
    await camp.save();
    req.flash("success", "Successfully made a new campsite!");
    res.redirect(`campsites/details/${camp.id}`);
  })
);

// U - Edit page for form to be on
router.get(
  "/edit/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id);
    if (!campsite) {
      req.flash("error", "Can't find that campsite!");
      return res.redirect("/campsites");
    }
    res.render("campsites/edit", { campsite });
  })
);

// U - PUT request from form on edit page
router.put(
  "/:id",
  isAuthor,
  validateCampsite,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campsite.findByIdAndUpdate(id, {
      ...req.body.campsite,
    });
    req.flash("success", "Successfully updated campsite!");
    res.redirect(`/campsites/details/${id}`);
  })
);

// D - DELETE request for button on details page
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    await Campsite.findByIdAndDelete(req.params.id);
    req.flash("success", "Campsite successfuly deleted");
    res.redirect("/campsites");
  })
);

module.exports = router;
