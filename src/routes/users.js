const express = require("express");
const { generateAccessToken, verifyToken } = require("../services/jwt");
const { authenticate } = require("../middlewares/passport");
const {
  signUp,
  verifyUser,
  resendOtp,
  signIn,
  forgotPasswordOtp,
  forgotPassword,
  resetPassword,
  getUsers,
  getSingleUser,
  updateUser,
  phoneNumberChangeOTP,
  changePhoneNumber,
  signUpForAdmin,
  signInByAdmin,
  createUser,
  deleteUser,
  updateUserByAdmin,
  contactUs,
  loginWithGoogle,
  getForgetPassVerificationLink,
  verifyOtpWithPasswordChange,
  getCustomerUser,
} = require("../controllers/users");
const { getCart, addToCart, removeFromCart } = require("../controllers/carts");
const {
  getWishlist,
  addToWishlist,
  removeWishlist,
} = require("../controllers/wishlists");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "This is register Page!" });
});

router.post("/signUp", signUp);
router.post("/contactUs", contactUs);

router.post("/signUpForAdmin", signUpForAdmin);
router.post("/verifyUser", verifyUser);
router.post("/resendOtp", resendOtp);
router.post("/signIn", signIn);
router.post("/loginWithGoogle", loginWithGoogle);
router.post("/signInByAdmin", signInByAdmin);
router.post("/forgotPasswordOtp", forgotPasswordOtp);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", authenticate, resetPassword);
router.get("/getUsers", authenticate, getUsers);
router.get("/getCustomerUser", authenticate, getCustomerUser);
router.post("/getForgetPassVerificationLink", getForgetPassVerificationLink);
router.post("/verifyOtpWithPasswordChange", verifyOtpWithPasswordChange);

// Admin
router
  .post("/user", authenticate, createUser)
  .put("/user", authenticate, updateUserByAdmin)
  .delete("/user", authenticate, deleteUser);

router.post("/refreshToken", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = verifyToken(refreshToken);

    const userId = decoded._id;

    const newAccessToken = generateAccessToken(userId);

    return res.status(200).json({ code: 200, accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ code: 401, message: error.message });
  }
});

router.get("/getCart/:id", authenticate, getCart);
router.post("/addToCart", authenticate, addToCart);
router.get("/getWishlist/:id", authenticate, getWishlist);
router.post("/addToWishlist", authenticate, addToWishlist);
router.post("/removeFromWishlist", authenticate, removeWishlist);
router.post("/removeFromCart", authenticate, removeFromCart);
router.get("/getSingleUser/:id", authenticate, getSingleUser);
router.post("/updateUser", authenticate, updateUser);
router.post("/phoneNumOTP", authenticate, phoneNumberChangeOTP);
router.post("/changePhoneNum", authenticate, changePhoneNumber);

module.exports = router;
