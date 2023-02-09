// Require the modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const PORT = process.env.PORT || 3000;

//Require the model
const Campsite = require("./models/campsite");

// Settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
mongoose.set("strictQuery", false);

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
  console.log("home page opened");
  res.render("home");
});


// C - Render the form to add new campsite
app.get("/campsites/new", (req, res) => {
  res.render("campsites/new");
});

// C - Form post request to add new campsite
app.post("/campsites", (req, res) => {
  const camp = new Campsite(req.body.campsite);
  camp.save();
  console.log(camp);
  res.redirect("/campsites");
});
