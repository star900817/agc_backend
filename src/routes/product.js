const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const ProductController = require("../controllers/product");

const router = express.Router();

router.post("/addNewProduct", authenticate , ProductController.addNewProduct);
router.get("/getProducts", authenticate, ProductController.getProducts);
router.put("/updateProduct", authenticate , ProductController.updateProduct);
router.get("/getOneProducts", authenticate , ProductController.getOneProducts);
router.delete("/deleteProduct", authenticate , ProductController.deleteProduct);


module.exports = router;
