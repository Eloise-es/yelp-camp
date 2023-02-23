const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;
// Require review model
const Review = require("./review");

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

CampsiteSchema.post("findOneAndDelete", async function (doc) {
  console.log(doc);
  if (doc) {
    await Review.deleteMany({
      id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campsite", CampsiteSchema);
