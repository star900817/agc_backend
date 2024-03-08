const { Spot } = require("@binance/connector");

exports.client = new Spot(process.env.BNC_API_KEY, process.env.BNC_API_SECRET, {
  //   baseURL: process.env.BNC_TESTNET_BASE_URL,
});
