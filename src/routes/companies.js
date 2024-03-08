const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const {
  getCompanies,
  createCompany,
  editCompany,
  deleteCompany,
} = require("../controllers/companies");

const router = express.Router();

router.get("/getCompany/:cId", authenticate, getCompanies);
router.post("/addCompany", authenticate, upload.single("image"), createCompany);
router.post("/editCompany", authenticate, upload.single("image"), editCompany);
router.delete("/deleteCompany", authenticate, deleteCompany);

module.exports = router;
