//Require the model
const Campsite = require("../models/campsite");

module.exports.index = async (req, res) => {
  const campsites = await Campsite.find({});
  res.render("campsites/index", { campsites });
};

module.exports.showCampsite = async (req, res) => {
  const { id } = req.params;
  const campsite = await Campsite.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(campsite);
  if (!campsite) {
    req.flash("error", "Can't find that campsite!");
    res.redirect("/campsites");
  } else {
    res.render("campsites/details", { campsite });
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("campsites/new");
};

module.exports.createNewCampsite = async (req, res) => {
  const camp = new Campsite(req.body.campsite);
  camp.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camp.author = req.user.id;
  await camp.save();
  req.flash("success", "Successfully made a new campsite!");
  res.redirect(`campsites/${camp.id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campsite = await Campsite.findById(id);
  if (!campsite) {
    req.flash("error", "Can't find that campsite!");
    return res.redirect("/campsites");
  }
  res.render("campsites/edit", { campsite });
};

module.exports.editCampsite = async (req, res) => {
  const { id } = req.params;
  await Campsite.findByIdAndUpdate(id, {
    ...req.body.campsite,
  });
  req.flash("success", "Successfully updated campsite!");
  res.redirect(`/campsites/${id}`);
};

module.exports.deleteCampsite = async (req, res) => {
  await Campsite.findByIdAndDelete(req.params.id);
  req.flash("success", "Campsite successfuly deleted");
  res.redirect("/campsites");
};
