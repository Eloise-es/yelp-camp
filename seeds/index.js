// Require the modules
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const axios = require("axios");

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

// Define size of sample
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Image generator
// const collectionID = 9046579; // the collection ID from the Unsplash url
// function renderImage(randomNumber) {
//   return `https://source.unsplash.com/collection/${collectionID}/480x400/?sig=${randomNumber}`;
// }

// New img generator
const renderImage = async (randomNumber) => {
  try {
    const res = await axios.get(
      `https://picsum.photos/id/${randomNumber}/info`
    );
    return res.data.download_url;
  } catch (e) {
    console.log("ERROR", e);
    return "https://images.unsplash.com/2/02.jpg?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
  }
};

// This will delete everything in the database, then replace it with 50 new campsites
const seedDB = async () => {
  await Campsite.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 50);
    const img1 = await renderImage(i + 32);
    const img2 = await renderImage(32 + Math.floor(Math.random() * 90));
    const images = [
      {
        url: img1,
        filename: `image ${i + 32}`,
        uploadedBy: "Eloise",
      },
      {
        url: img2,
        filename: `randomimage`,
        uploadedBy: "Eloise",
      },
    ];
    const camp = new Campsite({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: images,
      author: "640099d63b8d374ad71d94e4",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt enim nostrum minus provident error, dolorum doloribus necessitatibus ab itaque quaerat corporis mollitia aspernatur cupiditate modi eos porro? Voluptatem, itaque neque!",
      price,
    });
    await camp.save();
  }
  console.log("Created 50 campsites");
};

seedDB().then(() => {
  mongoose.connection.close();
});
