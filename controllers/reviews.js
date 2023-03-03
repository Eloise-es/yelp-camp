//Require the models
const Campsite = require("../models/campsite");
const Review = require("../models/review");
const { calculateAverageRating } = require("../middleware");

module.exports.createNewReview = async (req, res) => {
  const camp = await Campsite.findById(req.params.id);
  console.log(camp);
  const review = new Review(req.body.review);
  review.author = req.user.id;
  camp.reviews.push(review);
  await review.save();
  await camp.save();
  calculateAverageRating(req.params.id);
  req.flash("success", "Your review has been posted!");
  res.redirect(`/campsites/${camp.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campsite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  calculateAverageRating(id);
  req.flash("success", "Review successfully deleted!");
  res.redirect(`/campsites/${id}`);
};
