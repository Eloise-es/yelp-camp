// Require the modules
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

// Upload settings
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//Require the controller
const campsites = require("../controllers/campsites");

// Middleware (functions) for these routes
const { isLoggedIn, isAuthor, validateCampsite } = require("../middleware");

router
  .route("/")
  .get(catchAsync(campsites.index))
  .post(
    isLoggedIn,
    upload.array("campsite[img]"),
    validateCampsite,
    catchAsync(campsites.createNewCampsite)
  );

router.get("/new", isLoggedIn, campsites.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campsites.showCampsite))
  .put(isAuthor, validateCampsite, catchAsync(campsites.editCampsite))
  .delete(isLoggedIn, isAuthor, catchAsync(campsites.deleteCampsite));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campsites.renderEditForm)
);

module.exports = router;
