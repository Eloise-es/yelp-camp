const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

//Require the controller
const reviews = require("../controllers/reviews");

// Middleware related to this route
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

// C - Reviews form post request
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(reviews.createNewReview)
);

// D - reviews delete request
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
