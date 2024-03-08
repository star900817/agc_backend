const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String },
  otp: { type: String },
  createdAt: { type: Date, expires: "1h", default: Date.now },
});

const Otp = mongoose.model("Otp", otpSchema);

Otp.on("index", (error) => {
  if (error) {
    console.error("Error creating TTL index for OTP:", error.message);
  } else {
    console.log("TTL index created for OTP.");
  }
});

module.exports = Otp;
