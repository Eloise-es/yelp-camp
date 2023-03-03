const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "YelpCamp", allowedFormats: ["jpeg", "jpg", "png"] },
});

module.exports = {
  cloudinary,
  storage,
};
