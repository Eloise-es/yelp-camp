// Require the modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const PORT = process.env.PORT || 8081;

//Require the model

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
