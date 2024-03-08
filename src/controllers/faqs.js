const Faqs = require("../models/Faqs.js");
const User = require("../models/User.js");

exports.getFaqs = async (req, res) => {
  try {
    await Faqs.find()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Faqs fetched successfully",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          code: 400,
          message: error.message,
        });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.addOrUpdateFaqs = async (req, res) => {
  try {
    const { faqs } = req.body;
    let admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: "Admin not found!",
      });
    }
    if (admin.role != "admin") {
      return res.status(401).json({
        code: 401,
        message: "You are not allowed to access this!",
      });
    }
    let FaqsData = await Faqs.find();
    if (FaqsData.length > 0) {
      await Faqs.findOneAndUpdate({}, { $set: { faqs: faqs } }, { new: true })
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Faqs updated successfully",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({
            code: 400,
            message: error.message,
          });
        });
    } else {
      new Faqs({
        addedBy: admin._id,
        faqs: faqs,
      })
        .save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Faqs added successfully",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({
            code: 400,
            message: error.message,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
