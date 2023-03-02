const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

//Require the model and schema
const Campsite = require("../models/campsite");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");

// Middleware and functions related to this route
const { isLoggedIn } = require("../middleware");
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const calculateAverageRating = async (campId) => {
  const camp = await Campsite.findById(campId).populate("reviews");
  const allRatings = [];
  for (let review of camp.reviews) {
    allRatings.push(review.rating);
  }
  const sum = allRatings.reduce((a, b) => a + b, 0);
  const average = sum / allRatings.length;
  console.log("all: ", allRatings, "sum: ", sum, "Avg: ", average);
  await Campsite.findByIdAndUpdate(campId, {
    averageRating: average,
    numberOfRatings: allRatings.length,
  });
};

// C - Reviews form post request
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const camp = await Campsite.findById(req.params.id);
    console.log(camp);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    calculateAverageRating(req.params.id);
    req.flash("success", "Your review has been posted!");
    res.redirect(`/campsites/details/${camp.id}`);
  })
);

// D - reviews delete request
router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campsite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    calculateAverageRating(id);
    req.flash("success", "Review successfully deleted!");
    res.redirect(`/campsites/details/${id}`);
  })
);

module.exports = router;
