const { default: axios } = require('axios');
const { generateSignature } = require('../utils/generateSignature');
const Order = require('../models/Order');
/**
 * @desc    Create gift card
 * @route   POST /api/payments/checkout
 * @access  Private
 */
exports.checkout = async (req, res, next) => {
  console.log('1req body', req.body);
  try {
    req.body.timestamp = Math.floor(Date.now() / 1000);
    req.body.signature = await generateSignature(
      req.body.email,
      req.body.timestamp,
      process.env.MERCHANT_SECRET_KEY_PAYTIKO
    );

    const paytkoCheckoutUrl = `${process.env.CORE_URL_PAYTIKO}/api/sdk/checkout`;
    const paytkoHeaders = {
      'X-Merchant-Secret': process.env.MERCHANT_SECRET_KEY_PAYTIKO,
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'SDK API',
    };

    await axios
      .post(paytkoCheckoutUrl, req.body, {
        headers: paytkoHeaders,
      })
      .then(async (result) => {
        const newOrder = new Order({
          ...req.body.orderData,
        });

        newOrder
          .save()
          .then(async () => {
console.log("newOrder", newOrder)
            return res.status(200).json({
              code: 200,
              success: true,
              data: result.data,
            });
          })
          .catch((error) => {
            return res.status(400).json({
              success: false,
              data: error.message,
            });
          });
      })
      .catch((err) => {
        return res.status(400).json({
          success: false,
          data: err.message,
        });
      });
  } catch (error) {
    console.error('Error while creating checkout session: ', error);

    // Error from Paytko server
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        message: `Error from Paytko: ${error.response.statusText}`,
        data: error.response.data,
      });
    } else {
      // Error from this server
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
