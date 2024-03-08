const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const {
  addCardSliderImage,
  addPartnerLogoImage,
  getAllCMSImages,
  getCMSImages,
  deleteCMSImage,
} = require("../controllers/cms");

const router = express.Router();

router.post(
  "/addCardSliderImage",
  authenticate,
  upload.fields([{ name: "cardslider", maxCount: 5 }]),
  addCardSliderImage
);
router.post(
  "/addPartnerLogoImage",
  authenticate,
  upload.fields([{ name: "partnerlogo", maxCount: 5 }]),
  addPartnerLogoImage
);
router.get("/getCMSImages", getCMSImages);
router.get("/getAllCMSImages", authenticate, getAllCMSImages);
router.delete("/deleteCMSImage", authenticate, deleteCMSImage);

module.exports = router;
