// Require the modules
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

//Require the controller
const campsites = require("../controllers/campsites");

// Middleware (functions) for these routes
const { isLoggedIn, isAuthor, validateCampsite } = require("../middleware");

// R - View all campsites index
router.get("/", catchAsync(campsites.index));

// R - Show details page for specific campsite
router.get("/details/:id", catchAsync(campsites.showCampsite));

// C - Render the form to add new campsite
router.get("/new", isLoggedIn, campsites.renderNewForm);

// C - Form post request to add new campsite
router.post(
  "/",
  isLoggedIn,
  validateCampsite,
  catchAsync(campsites.createNewCampsite)
);

// U - Edit page for form to be on
router.get(
  "/edit/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campsites.renderEditForm)
);

// U - PUT request from form on edit page
router.put(
  "/:id",
  isAuthor,
  validateCampsite,
  catchAsync(campsites.editCampsite)
);

// D - DELETE request for button on details page
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campsites.deleteCampsite)
);

module.exports = router;
