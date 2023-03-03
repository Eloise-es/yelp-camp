// Require error handling
const ExpressError = require("./utils/ExpressError");

//Require the model and schema
const Campsite = require("./models/campsite");
const { campsiteSchema } = require("./schemas.js");
const Review = require("./models/review");
const { reviewSchema } = require("./schemas.js");

// Used on all routes
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// Used on CAMPSITE routes
module.exports.validateCampsite = (req, res, next) => {
  const { error } = campsiteSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campsite = await Campsite.findById(id);
  if (!campsite.author.equals(req.user.id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campsites/details/${id}`);
  }
  next();
};

// Used on REVIEW routes
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
module.exports.calculateAverageRating = async (campId) => {
  const camp = await Campsite.findById(campId).populate("reviews");
  const allRatings = [];
  for (let review of camp.reviews) {
    allRatings.push(review.rating);
  }
  if (!allRatings.length) {
    await Campsite.findByIdAndUpdate(campId, {
      averageRating: undefined,
      numberOfRatings: undefined,
    });
  } else {
    const sum = allRatings.reduce((a, b) => a + b, 0);
    const average = sum / allRatings.length;
    console.log("all: ", allRatings, "sum: ", sum, "Avg: ", average);
    await Campsite.findByIdAndUpdate(campId, {
      averageRating: average,
      numberOfRatings: allRatings.length,
    });
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user.id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campsites/details/${id}`);
  }
  next();
};
