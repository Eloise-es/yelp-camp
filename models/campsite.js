const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;
// Require review model
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
  uploadedBy: String,
});
// Save review IDs to an array, with ref 'Review' meaning review schema
const campsiteSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  images: [],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  averageRating: Number,
  numberOfRatings: Number,
});

campsiteSchema.post("findOneAndDelete", async function (doc) {
  console.log(doc);
  if (doc) {
    await Review.deleteMany({
      id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campsite", campsiteSchema);
