// Get access to ENV variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Require the modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const ExpressError = require("./utils/ExpressError");

// ENV VARIABLES
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL; // || "mongodb://127.0.0.1:27017/yelp-camp";

// Require the routes
const userRoutes = require("./routes/users");
const campsiteRoutes = require("./routes/campsites");
const reviewRoutes = require("./routes/reviews");

// Require the models
const User = require("./models/user");

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
// SECURITY
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dzqkr91yz/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dzqkr91yz/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dzqkr91yz/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dzqkr91yz/"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dzqkr91yz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://picsum.photos/id/",
        "https://fastly.picsum.photos/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dzqkr91yz/"],
      childSrc: ["blob:"],
    },
  })
);
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
// SESSIONS SETUP (using mongo store)
const sessionConfig = {
  name: "session", // don't use the default name (too easy to hack)
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, // doesn't work on localhost, should be true when deployed
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store: MongoStore.create({ mongoUrl: dbUrl }),
};
app.use(session(sessionConfig));

// PASSPORT SETUP (must come after session setup)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH + LOCAL MIDDLEWARE (must come after passport setup)
app.use(flash());
app.use((req, res, next) => {
  if (!["/login", "/"].includes(req.originalUrl)) {
    if (req.originalUrl.includes("reviews")) {
      req.session.returnTo = req.originalUrl.slice(0, -8);
    } else {
      req.session.returnTo = req.originalUrl;
    }
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Mongoose connection to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
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
app.use("/", userRoutes);
app.use("/campsites", campsiteRoutes);
app.use("/campsites/:id/reviews", reviewRoutes);

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
