const express = require("express");
const { authenticate } = require("../middlewares/passport");
const {
  getOrders,
  getAllOrders,
  sendProductCodeEmail,
  confirmOrderPayment,
  getOrdersByOrderId,
  orderWebhookManager,
} = require("../controllers/order");
const { redeemBitaqtyCard } = require("../controllers/giftCards");
const router = express.Router();

router.get("/getOrders", authenticate, getOrders);
router.get("/getOrdersByOrderId", getOrdersByOrderId);
router.get("/getAllOrders", authenticate, getAllOrders);
router.post("/sendProductCodeEmail", authenticate, sendProductCodeEmail);
router.post("/confirmOrderPayment", confirmOrderPayment);
router.post("/redeemBitaqtyCard", redeemBitaqtyCard);
router.post("/orderWebhookManager", orderWebhookManager);

module.exports = router;
