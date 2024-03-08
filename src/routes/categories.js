const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const {
  getCategories,
getCategoriesS,
  createCategory,
  editCategory,
  swapCategory,
  deleteCategory,
  getCategory,
} = require("../controllers/categories");

const router = express.Router();

router.route("/categories/:id").get(getCategory);

router.get("/getCategory", getCategories);
router.get("/getCategoryS", getCategoriesS);
router.post(
  "/addCategory",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subCategoryImage" },
  ]),
  createCategory
);
router.post(
  "/editCategory",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subCategoryImage" },
  ]),
  editCategory
);
router.post("/swapCategory", authenticate, swapCategory);
router.post("/deleteCategory", authenticate, deleteCategory);

module.exports = router;
