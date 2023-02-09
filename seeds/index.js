// Require the modules
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

//Require the model AND SEED DATA
const Campsite = require("../models/campsite");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

// Mongoose connection to MongoDB
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
  console.log("mongo connection open");
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// This will delete everything in the database, then replace it with 50 new campsites
const seedDB = async () => {
  await Campsite.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campsite({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
    });
    await camp.save();
  }
  console.log("Created 50 campsites");
};

seedDB().then(() => {
  mongoose.connection.close();
});
