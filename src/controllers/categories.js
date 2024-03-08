const Categories = require("../models/Category");
const User = require("../models/User");

exports.getCategoriesS = async (req, res) => {

  try {
    const categories = await Categories.find();
    if (!categories) {
      return res.status(404).json({
        code: 404,
        message: "Categories not found!",
      });
    }
    return res.status(200).json({
      code: 200,
      message: "Categories fetched successfully!",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};


exports.getCategories = async (req, res) => {

  try {
    const categories = await Categories.find();
    if (!categories) {
      return res.status(404).json({
        code: 404,
        message: "Categories not found!",
      });
    }
    const filteredCategories = categories.filter(category => category.name !== " ");

    return res.status(200).json({
      code: 200,
      message: "Categories fetched successfully!",
      data: filteredCategories,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: `Category not found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      code: 200,
      data: category,
    });
  } catch (error) {
    console.error("Error while getting category: ", error);
    res.status(500).json({ code: 500, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { uid, name, subCategories } = req.body;

    let subcategories = subCategories? Array.isArray(subCategories) ? subCategories.map((item, index) => {
	let subcategory = JSON.parse(item);
	subcategory['subCategoryImage'] = "images/" + req?.files.subCategoryImage[index]?.filename;
	return subcategory;
    }) : [{...JSON.parse(subCategories), 'subCategoryImage' : "images/" + req?.files.subCategoryImage[0]?.filename }] : [];

    var file = req?.files.image[0]?.filename;
    var image = "images/" + file;

    const findAdmin = await User.findById(req.user.id);
    var category;
    if (findAdmin.role == "admin") {      
      console.log(subcategories);
      category = new Categories({
        name,
        image,
        'subCategories' : subcategories,
      });
      await category
        .save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Category created successfully!",
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

exports.editCategory = async (req, res) => {
  const { categoryId, name, imageDetails, subCategories, imageChangeIndex } =
    req.body;

  const categoryData = await Categories.findById(categoryId);

  let subCategoryData = imageDetails? Array.isArray(imageDetails) ? imageDetails.map((item, index) => {
	let subcategory = JSON.parse(item);
	return subcategory;
    }) : [{...JSON.parse(imageDetails)}] : [];

  JSON.parse(imageChangeIndex)?.map((num, index) => {
    subCategoryData[
      num
    ].subCategoryImage = `images/${req.files.subCategoryImage[index]?.filename}`;
  });

  var file = req.files.image && req?.files?.image[0]?.filename;
  var image = "images/" + file;

  try {
    const findAdmin = await User.findById(req.user.id);
    if (findAdmin.role == "admin") {
      if (file == undefined) {
        let dataToUpdate = {
          ...req.body,
          ...{ subCategories: subCategoryData },
        };

        await Categories.findByIdAndUpdate(categoryId, {
          ...dataToUpdate,
        })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Category updated successfully!",
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
      } else {
        let dataToUpdate = {
          ...req.body,
          image,
          ...{ subCategories: subCategoryData },
        };

        await Categories.findByIdAndUpdate(categoryId, { ...dataToUpdate })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Category updated successfully!",
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

exports.swapCategory = async (req, res) => {
  const { firstID, secondID } = req.body;

  const firstCategory = await Categories.findById(firstID);
  const secondCategory = await Categories.findById(secondID);

  try {
    const findAdmin = await User.findById(req.user.id);
    if (findAdmin.role == "admin") {
      await Categories.findByIdAndUpdate(firstID, {
        'name' : secondCategory.name,
	'image' : secondCategory.image,
	'subCategories' : secondCategory.subCategories
      });
      await Categories.findByIdAndUpdate(secondID , {
        'name' : firstCategory.name,
	'image' : firstCategory.image,
	'subCategories' : firstCategory.subCategories
      });
      return res.status(200).json({
        code: 200,
        message: "Categories updated successfully!",
      });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.body;
  console.log("categoryId", categoryId);
  try {
    const findAdmin = await User.findById(req.user.id);

    console.log("findAdmin", findAdmin);

    if (findAdmin.role == "admin") {
      await Categories.findByIdAndDelete(categoryId)
        .then((result) => {
          return res
            .status(200)
            .json({ code: 200, message: "Category deleted successfully!" });
        })
        .catch((error) => {
          console.log(error, "Check");
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
