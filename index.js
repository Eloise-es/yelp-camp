// Require the modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const PORT = process.env.PORT || 3000;

// Require the routes
const campsites = require("./routes/campsites");
const reviews = require("./routes/reviews");

// Settings
mongoose.set("strictQuery", false);
app.use(express.urlencoded({ extended: true }));
// EJS SETUP
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// SERVE DIRECTORIES
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
// OTHER MODULES
app.use(methodOverride("_method"));
app.use(morgan("dev"));
// SESSIONS SETUP
const sessionConfig = {
  secret: "thisshouldbeabettersecret!!!",
  resave: false,
  saveUninitialized: true,
};
app.use(session(sessionConfig));

// Mongoose connection to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
  console.log("mongo connection open");
}

// Listen on the port
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

// Get request for home page
app.get("/", (req, res) => {
  res.render("home");
});

// CAMPSITES and REVIEWS (link to routes)
app.use("/campsites", campsites);
app.use("/campsites/:id/reviews", reviews);

// Error handling!!! Page doesn't exist
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// Error handling!!! All errors lead here
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Not sure what went wrong";
  if (!err.statusCode) err.statusCode = 500;
  res.status(statusCode).render("error", { err });
});
