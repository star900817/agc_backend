const axios = require("axios");
const crypto = require('crypto');
const { client } = require("../configs/binance");

/**
 * Get account information of the client
 */
exports.getAccountInformation = async () => {
  const response = await client.account();

  return response.data;
};

/**
 * Create a single token gift card
 *
 * {@link https://binance-docs.github.io/apidocs/spot/en/#create-a-binance-code-user_data}
 *
 * @param {string} token
 * @param {number} amount
 */
exports.createGiftCardCode = async (token, amount) => {
  const timestamp = Date.now();
  const params = `token=${token}&amount=${amount}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', process.env.BNC_API_SECRET).update(params).digest('hex');

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.BNC_SPOT_BASE_URL}/sapi/v1/giftcard/createCode?${params}&signature=${signature}`,
    headers: {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": `${process.env.BNC_API_KEY}`,
    },
  };
  try {
    const response = await axios.request(config);
console.log(response.data, "data")
    return response.data
  } catch (err) {
    throw err;
  }
};

exports.buyGiftCardCode = async (baseToken, faceToken, baseTokenAmount) => {

  const timestamp = Date.now();
  const params = `baseToken=${baseToken}&faceToken=${faceToken}&baseTokenAmount=${baseTokenAmount}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', process.env.BNC_API_SECRET).update(params).digest('hex');

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.BNC_SPOT_BASE_URL}/sapi/v1/giftcard/buyCode?${params}&signature=${signature}`,
    headers: {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": `${process.env.BNC_API_KEY}`,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data
  } catch (err) {
    throw err;
  }
};

/**
 * Verify a gift card by reference number
 *
 * {@link https://binance-docs.github.io/apidocs/spot/en/#verify-a-binance-code-user_data}
 *
 * @param {string} referenceNo
 */
exports.verifyGiftCardCode = async (referenceNo) => {
  const timestamp = Date.now();
  const params = `referenceNo=${referenceNo}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', process.env.BNC_API_SECRET).update(params).digest('hex');

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.BNC_SPOT_BASE_URL}/sapi/v1/giftcard/verify?${params}&signature=${signature}`,
    headers: {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": `${process.env.BNC_API_KEY}`,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data
  } catch (err) {
    throw err;
  }
};

/**
 * Redeem a gift card
 *
 * {@link https://binance-docs.github.io/apidocs/spot/en/#redeem-a-binance-code-user_data}
 *
 * @param {string} code
 */
exports.redeemGiftCardCode = async (code) => {
  const timestamp = Date.now();
  const params = `code=${code}&timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', process.env.BNC_API_SECRET).update(params).digest('hex');

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.BNC_SPOT_BASE_URL}/sapi/v1/giftcard/redeemCode?${params}&signature=${signature}`,
    headers: {
      "Content-Type": "application/json",
      "X-MBX-APIKEY": `${process.env.BNC_API_KEY}`,
    },
  };

  try {
    const response = await axios.request(config);
    return response.data
  } catch (err) {
    throw err;
  }
};
