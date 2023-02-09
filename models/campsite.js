const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;

const CampsiteSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

module.exports = mongoose.model("Campsite", CampsiteSchema);
