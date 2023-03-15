const mongoose = require("mongoose");
// Shorthand for mongoose.Schema
const Schema = mongoose.Schema;
// Require review model
const Review = require("./review");
// Make virtuals available in JSON
const opts = { toJSON: { virtuals: true } };

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
const campsiteSchema = new Schema(
  {
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
  },
  opts
);

campsiteSchema.virtual("properties.popUpHTML").get(function () {
  return `<h5>${this.title}</h5>
  <ul>
  <li>${this.location}</li>
  <li>£${this.price} per night </li>
  </ul>
  <a class="btn btn-sm btn-light" href="/campsites/${this.id}">See more</a>
  `;
  // <h4> ${title}</h4><p>Price per night: ${price}</p>
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
