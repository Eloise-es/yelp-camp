const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;

const CampsiteSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  img: String,
});

module.exports = mongoose.model("Campsite", CampsiteSchema);
