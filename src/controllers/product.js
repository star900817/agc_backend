const CMS = require("../models/Cms");
const User = require("../models/User");
const product = require("../models/product");

exports.addNewProduct = async (req, res) => {
  try {
    let admin = await User.findById(req.user.id)
    if(!admin) {
      return res.status(404).json({ code: 404, message: "User not found!" });
    }
    if(admin.role != "admin") {
      return res.status(401).json({ code: 401, message: "Access denied!" });
    }
    await new CMS({

    }).save()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Product added successfully!",
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

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.body
      let admin = await User.findById(req.user.id)
      if(!admin) {
        return res.status(404).json({ code: 404, message: "User not found!" });
      }
      if(admin.role != "admin") {
        return res.status(401).json({ code: 401, message: "Access denied!" });
      }
      await CMS.findByIdAndUpdate(productId,{
  
      }).save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Product updated successfully!",
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

exports.getProducts = async (req, res) => {
  try {
    let admin = await User.findById(req.user.id)
    if(!admin) {
      return res.status(404).json({ code: 404, message: "User not found!" });
    }
    // if(admin.role != "admin") {
    //   return res.status(401).json({ code: 401, message: "Access denied!" });
    // }
    await CMS.find({})
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Products fetched successfully!",
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

exports.getOneProducts = async (req, res) => {
    try {
      let admin = await User.findById(req.user.id)
      if(!admin) {
        return res.status(404).json({ code: 404, message: "User not found!" });
      }
      // if(admin.role != "admin") {
      //   return res.status(401).json({ code: 401, message: "Access denied!" });
      // }
      await CMS.find({_id: req.query.productId})
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Product fetched successfully!",
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

exports.deleteProduct = async (req, res) => {
    try {
      let admin = await User.findById(req.user.id)
      if(!admin) {
        return res.status(404).json({ code: 404, message: "User not found!" });
      }
      // if(admin.role != "admin") {
      //   return res.status(401).json({ code: 401, message: "Access denied!" });
      // }
      await CMS.findByIdAndDelete({_id: req.query.productId})
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Product deleted successfully!",
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

