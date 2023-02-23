// Require the modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const PORT = process.env.PORT || 3000;

//Require the model and schema
const Campsite = require("./models/campsite");
const { campsiteSchema, reviewSchema } = require("./schemas.js");
const Review = require("./models/review");

// Settings
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
mongoose.set("strictQuery", false);

// Mongoose connection to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
  console.log("mongo connection open");
}

const validateCampsite = (req, res, next) => {
  const { error } = campsiteSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

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

// Listen on the port
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

// Get request for home page
app.get("/", (req, res) => {
  res.render("home");
});

// R - View all campsites index
app.get(
  "/campsites",
  catchAsync(async (req, res) => {
    const campsites = await Campsite.find({});
    res.render("campsites/index", { campsites });
  })
);

// R - Show details page for specific campsite
app.get(
  "/campsites/details/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id).populate("reviews");
    res.render("campsites/details", { campsite });
  })
);

// C - Render the form to add new campsite
app.get("/campsites/new", (req, res) => {
  res.render("campsites/new");
});

// C - Form post request to add new campsite
app.post(
  "/campsites",
  validateCampsite,
  catchAsync(async (req, res) => {
    const camp = new Campsite(req.body.campsite);
    await camp.save();
    console.log(camp);
    res.redirect(`campsites/details/${camp.id}`);
  })
);

// U - Edit page for form to be on
app.get(
  "/campsites/edit/:id",
  catchAsync(async (req, res) => {
    const campsite = await Campsite.findById(req.params.id);
    res.render("campsites/edit", { campsite });
  })
);

// U - PUT request from form on edit page
app.put(
  "/campsites/:id",
  validateCampsite,
  catchAsync(async (req, res) => {
    const campsite = await Campsite.findByIdAndUpdate(req.params.id, {
      ...req.body.campsite,
    });
    res.redirect(`/campsites/details/${campsite.id}`);
  })
);

// D - DELETE request for button on details page
app.delete(
  "/campsites/:id",
  catchAsync(async (req, res) => {
    await Campsite.findByIdAndDelete(req.params.id);
    res.redirect("/campsites");
  })
);

// REVIEWS

// C - Reviews form post request
app.post(
  "/campsites/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const camp = await Campsite.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    calculateAverageRating(req.params.id);
    res.redirect(`/campsites/details/${camp.id}`);
  })
);

// D - reviews delete request
app.delete(
  "/campsites/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campsite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    calculateAverageRating(id);
    res.redirect(`/campsites/details/${id}`);
  })
);

// Error handling!!!

// Page doesn't exist
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// All errors lead here
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Not sure what went wrong";
  if (!err.statusCode) err.statusCode = 500;
  res.status(statusCode).render("error", { err });
});
