const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;

// Save review IDs to an array, with ref 'Review' meaning review schema
const CampsiteSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  img: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  averageRating: Number,
  numberOfRatings: Number,
});

module.exports = mongoose.model("Campsite", CampsiteSchema);
