const Companies = require("../models/Company");
const User = require("../models/User");

exports.getCompanies = async (req, res) => {
  try {
    const cId = req.params.cId;
    const companies = await Companies.find({ categoryId: cId });
    if (!companies) {
      return res.status(404).json({
        code: 404,
        message: "Companies not found!",
      });
    }
    return res.status(200).json({
      code: 200,
      message: "Companies fetched successfully!",
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { uId, name, categoryId } = req.body;
    const findAdmin = await User.findById(uId);
    if (findAdmin.role == "admin") {
      var file = req?.file?.filename;
      var image = "images/" + file;
      const company = new Companies({ categoryId, name, image });
      await company
        .save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Company created successfully!",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.editCompany = async (req, res) => {
  const { uId, cId, name, categoryId } = req.body;
  var file = req?.file?.filename;
  var image = "images/" + file;
  try {
    const findAdmin = await User.findById(uId);
    if (findAdmin.role == "admin") {
      if (file == undefined) {
        await Companies.findByIdAndUpdate(cId, { categoryId, name })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Company updated successfully!",
              data: result,
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
      } else {
        await Companies.findByIdAndUpdate(cId, { categoryId, name, image })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Company updated successfully!",
              data: result,
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
      }
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { cId } = req.body;
    await Companies.findByIdAndDelete(cId)
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Company deleted successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
