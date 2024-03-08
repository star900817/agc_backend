const express = require("express");
const { authenticate } = require("../middlewares/passport");
const {
  getFaqs,
  addOrUpdateFaqs
} = require("../controllers/faqs");
const router = express.Router();

router.get("/getFaqs", getFaqs);
router.post("/addOrUpdateFaqs", authenticate, addOrUpdateFaqs);

module.exports = router;
