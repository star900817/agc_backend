const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const advancedResults = require("../middlewares/advanceResults");
const {
  getGifts,
  createGift,
  editGift,
  deleteGift,
  getSpecificGift,
  searchGift,
  getBitaqatyGiftCards,
  getBitaqatySingleGiftCard,
  getBitaqtyGifts,
  getSearchProducts,
  addBitaqtyGifts,
  updateBitaqtyGifts,
  deleteBitaqtyGifts,
  getAllGiftCards,
  getGiftsByCollection,
  addBinanceGifts,
  getBinanceGifts,
  deleteBinanceGifts,
  getBinanceAdvanced,
  updateBinanceGifts,
} = require("../controllers/gifts");
const Bitaqty = require("../models/Bitaqty");
const Binance = require("../models/Binance");

const router = express.Router();

router.get("/getGifts/:coId/:caId", getGifts);
router.get("/getGiftsByCollection/:collectionName", getGiftsByCollection);

router.post(
  "/addBitaqtyGifts",
  authenticate,
  upload.single("image"),
  addBitaqtyGifts
);

router.get(
  "/getBinanceAdvanced",
  advancedResults(Binance, "category"),
  getBinanceAdvanced
);

router.post(
  "/addBinanceGifts",
  authenticate,
  upload.single("image"),
  addBinanceGifts
);

router.get("/getBinanceGifts", authenticate, getBinanceGifts);

router.put(
  "/updateBitaqtyGifts",
  authenticate,
  upload.single("image"),
  updateBitaqtyGifts
);

router.put(
  "/updateBinanceGifts",
  authenticate,
  upload.single("image"),
  updateBinanceGifts
);

router.delete("/deleteBitaqtyGifts", authenticate, deleteBitaqtyGifts);
router.delete("/deleteBinanceGifts", authenticate, deleteBinanceGifts);

router.get(
  "/getBitaqtyGifts",
  advancedResults(Bitaqty, "category"),
  getBitaqtyGifts
);

router.get(
  "/getAdvancedBinanceGifts",
  advancedResults(Binance, "category"),
  getBinanceAdvanced
);
router.get("/getAllGiftCards", authenticate, getAllGiftCards);
router.get("/getSearchProducts", getSearchProducts);
router.post("/addGift", authenticate, upload.single("image"), createGift);
router.post("/editGift", authenticate, upload.single("image"), editGift);
router.delete("/deleteGift", authenticate, deleteGift);
router.get("/getGift/:id", authenticate, getSpecificGift);
router.get("/searchGifts/:coId/:caId", authenticate, searchGift);
router.get("/bitaqaty", getBitaqatyGiftCards);
router.get("/bitaqaty/:id", getBitaqatySingleGiftCard);
module.exports = router;
