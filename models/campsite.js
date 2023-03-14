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

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
ImageSchema.virtual("card").get(function () {
  return this.url.replace("/upload", "/upload/ar_4:3,c_crop");
});

// Save review IDs to an array, with ref 'Review' meaning review schema
const campsiteSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  images: [ImageSchema],
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
