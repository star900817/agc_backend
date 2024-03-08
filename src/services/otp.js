const otpGenerator = require("otp-generator");
const { OTP_DIGITS } = require("../utils/constants");

exports.generateOtp = async () => {
  const random = await otpGenerator.generate(OTP_DIGITS, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  return random;
};
