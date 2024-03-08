const CryptoJS = require("crypto-js");

exports.generateSignature = async (email, timestamp, secretKey) => {
  const rawSignature = `${email};${timestamp};${secretKey}`;

  const signature = CryptoJS.SHA256(rawSignature).toString();

  return signature;
};
