const CMS = require("../models/Cms");
const User = require("../models/User");

exports.addCardSliderImage = async (req, res) => {
  try {
    let resultArray = [];
    for (let img of req.files.cardslider) {
      let URL = `/CMS/cardslider/${img.filename}`;
      await new CMS({
        imageURL: URL,
      })
        .save()
        .then((result) => {
          resultArray.push(result);
        });
    }
    return res.status(200).json({
      code: 200,
      message: "Cardslider Images added successfully!",
      data: resultArray,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.addPartnerLogoImage = async (req, res) => {
  try {
    const { imageType } = req.body;
    let resultArray = [];
    for (let img of req.files.partnerlogo) {
      let URL = `/CMS/partnerlogo/${img.filename}`;
      await new CMS({
        imageType: imageType ? imageType : "partnerLogo",
        imageURL: URL,
      })
        .save()
        .then((result) => {
          resultArray.push(result);
        });
    }
    return res.status(200).json({
      code: 200,
      message: "Partnerlogo Images added successfully!",
      data: resultArray,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getCMSImages = async (req, res) => {
  try {
    await CMS.find()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Images fetched successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getAllCMSImages = async (req, res) => {
  try {
    let admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ code: 404, message: "User not found!" });
    }
    if (admin.role != "admin") {
      return res.status(401).json({ code: 401, message: "Access denied!" });
    }
    await CMS.find()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Images fetched successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteCMSImage = async (req, res) => {
  try {
    let admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ code: 404, message: "User not found!" });
    }
    if (admin.role != "admin") {
      return res.status(401).json({ code: 401, message: "Access denied!" });
    }
    await CMS.findByIdAndDelete({ _id: req.query.imageId })
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Image deleted successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};
