const { Router } = require("express");
const {
  createGiftCard,
  verifyGiftCard,
  redeemGiftCard,
  getSimilarCards,
  getSimilarCardsForcart,
} = require("../controllers/giftCards.js");

const router = Router();

router.route("/").post(createGiftCard);
router.route("/verify/:referenceNo").get(verifyGiftCard);
router.route("/redeem/:code").get(redeemGiftCard);
router.route("/getSimilarCards/:productIdToAvoid").get(getSimilarCards);
router.route("/getSimilarCardsForcart").post(getSimilarCardsForcart);
module.exports = router;
