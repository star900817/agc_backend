const { default: axios } = require("axios");

async function sendOptOnPhone(to, message) {
  try {
    const requestData = {
      AppSid: process.env.APP_SID,
      Recipient: to,
      Body: message,
      SenderID: process.env.SENDER_ID,
    };

    const response = await axios.post(
      process.env.UNIFONIC_API_BASE_URL,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return {
      success: true,
      message: "Otp sent on mobile Successfully",
      data: response.data,
    };
  } catch (error) {
    return { success: false, message: error.message, data: null };
  }
}

module.exports = {
  sendOptOnPhone,
};
