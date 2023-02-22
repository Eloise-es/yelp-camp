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
const { campsiteSchema } = require("./schemas.js");
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
    const campsite = await Campsite.findById(id);
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

// Reviews form post request
app.post(
  "/campsites/:id/reviews",
  catchAsync(async (req, res) => {
    const camp = await Campsite.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    console.log(camp, review);
    res.redirect(`/campsites/details/${camp.id}`);
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
