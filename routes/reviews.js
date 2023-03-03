const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

//Require the models
const Campsite = require("../models/campsite");
const Review = require("../models/review");

// Middleware and functions related to this route
const {
  isLoggedIn,
  validateReview,
  calculateAverageRating,
} = require("../middleware");

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
