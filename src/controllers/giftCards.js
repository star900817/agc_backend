const axios = require("axios");
const crypto = require("crypto");

const Bitaqty = require("../models/Bitaqty");
const {
  createGiftCardCode,
  verifyGiftCardCode,
  redeemGiftCardCode,
} = require("../services/binance");

/**
 * @desc    Create gift card
 * @route   POST /api/gift-cards
 * @access  Private
 */
exports.createGiftCard = async (req, res, next) => {
  try {
    const { token, amount } = req.body;

    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Please enter token",
      });
    }

    if (!amount) {
      return res.status(400).json({
        code: 400,
        message: "Please enter amount",
      });
    }

    const giftCard = await createGiftCardCode(token, amount);

    res.status(201).json({
      success: true,
      data: giftCard.data,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc    Verify gift card
 * @route   GET /api/gift-cards/verify/referenceNo
 * @access  Private
 */
exports.verifyGiftCard = async (req, res, next) => {
  try {
    const { referenceNo } = req.params;

    const verifiedGiftCard = await verifyGiftCardCode(referenceNo);

    res.status(200).json({
      success: true,
      data: verifiedGiftCard.data,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc    Redeem gift card
 * @route   GET /api/gift-cards/redeem/code
 * @access  Private
 */
exports.redeemGiftCard = async (req, res, next) => {
  try {
    const { code } = req.params;

    const giftCard = await redeemGiftCardCode(code);

    res.status(200).json({
      success: true,
      data: giftCard.data,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc    Redeem bitaqty card
 * @route   POST /api/gift-cards/redeemBitaqtyCard
 * @access  Authenticate
 */

exports.redeemBitaqtyCard = async (req, res, next) => {
  try {
    const { giftCardId, amountToRedeem } = req.body;

    const password = crypto.createHash("md5");
    password.update(
      process.env.RESELLER_USERNAME +
        giftCardId +
        process.env.BITAQATY_SECRET_KEY
    );

    const payload = {
      resellerUsername: process.env.RESELLER_USERNAME,
      merchantId: "",
      password: password.digest("hex"),
      productID: giftCardId,
      amountToRedeem: amountToRedeem,
    };

    const response = await axios.post(
      process.env.CORE_URL_BITAQATY + "/integration/purchase-product",
      payload
    );

    res.status(200).json({
      code: 200,
      message: "Gift card redeemed successfully.",
      payload,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc Get similar gift cards
 * @route GET /api/gift-cards/getSimilarCards/:productIdToAvoid/:productCategory
 * @access Public
 */
exports.getSimilarCards = async (req, res, next) => {
  try {
    const { productIdToAvoid } = req.params;

    const productToAvoid = await Bitaqty.findById(productIdToAvoid);

    if (!productToAvoid) {
      return res.status(404).send("No simillar product Found");
    }

    const productCategory = productToAvoid.productDetails.categoryNameEn;

    const similarProducts = await Bitaqty.find({
      _id: { $ne: productIdToAvoid }, // Exclude the specified product ID
      "productDetails.categoryNameEn": productCategory, // Match the given product category
    }).limit(4);

    return res.status(200).json({
      code: 200,
      message: "Similar product fetched.",
      data: similarProducts,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc Get similar gift cards for Cart page
 * @route GET /api/gift-cards/getSimilarCardsForcart
 * @access Public
 */

exports.getSimilarCardsForcart = async (req, res, next) => {
  try {
    const { productCategory, productIdToAvoid } = req.body;

    // Store similar products for all categories
    let similarProducts = [];

    // Iterate through each category and find similar products
    for (const category of productCategory) {
      const products = await Bitaqty.find({
        _id: { $nin: productIdToAvoid }, // Exclude specified product IDs
        "productDetails.categoryNameEn": category, // Match the current category
      }).limit(productIdToAvoid.length == 1 ? 4 : 2); // Limit to 2 similar products for each category

      // Merge the current category's products into the result array
      similarProducts = [...similarProducts, ...products];
    }

    return res.status(200).json({
      code: 200,
      message: "Similar product fetched.",
      data: similarProducts,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
