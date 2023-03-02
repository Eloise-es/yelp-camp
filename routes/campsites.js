// Require the modules
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

//Require the model and schema
const Campsite = require("../models/campsite");
const { campsiteSchema } = require("../schemas.js");

// Middleware/functions for these routes
const { isLoggedIn } = require("../middleware");
const validateCampsite = (req, res, next) => {
  const { error } = campsiteSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

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
    const campsite = await Campsite.findById(id).populate("reviews");
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
    await camp.save();
    req.flash("success", "Successfully made a new campsite!");
    res.redirect(`campsites/details/${camp.id}`);
  })
);

// U - Edit page for form to be on
router.get(
  "/edit/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const campsite = await Campsite.findById(req.params.id);
    res.render("campsites/edit", { campsite });
  })
);

// U - PUT request from form on edit page
router.put(
  "/:id",
  isLoggedIn,
  validateCampsite,
  catchAsync(async (req, res) => {
    const campsite = await Campsite.findByIdAndUpdate(req.params.id, {
      ...req.body.campsite,
    });
    req.flash("success", "Successfully updated campsite!");
    res.redirect(`/campsites/details/${campsite.id}`);
  })
);

// D - DELETE request for button on details page
router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    await Campsite.findByIdAndDelete(req.params.id);
    req.flash("success", "Campsite successfuly deleted");
    res.redirect("/campsites");
  })
);

module.exports = router;
