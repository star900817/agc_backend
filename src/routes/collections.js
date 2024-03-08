const express = require("express");
const { authenticate } = require("../middlewares/passport");
const { upload } = require("../middlewares/upload");
const {
  getCollections,
getCollectionsS,
  createCollection,
  editCollection,
  deleteCollection,
  getCollection,
  swapCollection,
} = require("../controllers/collections");

const router = express.Router();

router.route("/collections/:id").get(getCollection);

router.get("/getCollection", getCollections);
router.get("/getCollectionsS", getCollectionsS);
router.post(
  "/addCollection",
  authenticate,
  upload.fields([
  ]),
  createCollection
);
router.post(
  "/editCollection",
  authenticate,
  upload.fields([
  ]),
  editCollection
);
router.post("/swapCollection", authenticate, swapCollection);
router.post("/deleteCollection", authenticate, deleteCollection);

module.exports = router;
