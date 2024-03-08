const { sns } = require("../configs/aws");

/**
 * Send OTP
 *
 * @param {number} otp
 * @param {number} phoneNumber
 * @returns
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

exports.sendOtp = async (otp, phoneNumber) => {
  // const params = {
  //   Message: `Welcome! Your account verification code is: ${otp}`,
  //   PhoneNumber: phoneNumber,
  //   Subject: "Verification",
  // };

  // return sns.publish(params).promise();
  try {
    await client.messages
      .create({
        from: "+18173493367",
        body: `Verification OTP : ${otp}`,
        to: `${phoneNumber}`,
      })
      .then((result) => {
        console.log(result, "....res");
      })
      .catch((err) => {
        console.log(err.message, "....errror");
      });
  } catch (error) {
    console.error("Error sending OTP via SMS:", error);
    throw error;
  }
};
