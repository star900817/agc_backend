const { default: axios } = require("axios");
const { generateSignature } = require("../utils/generateSignature");
const Order = require("../models/Order");
const User = require("../models/User");
const Binance = require("../models/Binance");
const Bitaqty = require("../models/Bitaqty");
const nodemailer = require("nodemailer");
const { CodeSharingTemplate } = require("../emailTemplate/CodeSharingTemplate");

/**
 * @desc    Create gift card
 * @route   POST /api/payments/checkout
 * @access  Private
 */
exports.checkout = async (req, res, next) => {
console.log("req body", req.body.orderData)
  try {
    req.body.timestamp = Math.floor(Date.now() / 1000);
    req.body.signature = await generateSignature(
      req.body.email,
      req.body.timestamp,
      process.env.MERCHANT_SECRET_KEY_PAYTIKO
    );

    const paytkoCheckoutUrl = `${process.env.CORE_URL_PAYTIKO}/api/sdk/checkout`;
    const paytkoHeaders = {
      "X-Merchant-Secret": process.env.MERCHANT_SECRET_KEY_PAYTIKO,
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "SDK API",
    };

    await axios
      .post(paytkoCheckoutUrl, req.body, {
        headers: paytkoHeaders,
      })
      .then(async (result) => {

        const newOrder = new Order({
          ...req.body.orderData,
        });
	console.log(newOrder, "newOrder")

        newOrder
          .save()
          .then(async() => { 
	  
	  if(newOrder.isPaymentSuccess) {
		const emailData = [];
		const email = req.body.email;
		const orderId = newOrder.orderId;

		for(let i = 0; i < newOrder.products.length; i++) {
		  if(newOrder.products[i].productType === 'binance') {
		    const product = await Binance.findById(newOrder.products[i].productId)
		    product.minQty -= newOrder.products[i].quantity
			await product.save()
		    const emailItem = {codeString: product.giftCards[0].code, productId: product._id, productImage: product.image, productName: product.title, productQty: newOrder.products[i].quantity, productSKU: product.giftCards[0].referenceNo}

		    emailData.push(emailItem)
		  }
		}

		const transporter = nodemailer.createTransport({
      		  host: process.env.NODEMAILTER_HOST,
      		  port: process.env.NODEMAILTER_PORT,
      		  secure: true,
      		  auth: {
        		user: process.env.NODEMAILTER_USER,
        		pass: process.env.NODEMAILER_PASSWORD,
    		  },
    		});

		const emailSent = await CodeSharingTemplate({
      		  to: email,
      		  from: process.env.NODEMAILTER_USER,
      		  subject: "Arab gift cards: (Confidential) Redeem codes for gift cards",
      		  productData: emailData,
      		  transporter,
   		});

    		if (emailSent) {
console.log("successfuly email sent!")
      		  const changeRedeemCodeSharingStatus = await Order.findOneAndUpdate(
    		    { orderId: orderId }, 
   		    { isRedeemCodeShared: true },
    		    { new: true } 
		  );;
 		};
	  }

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
    console.error("Error while creating checkout session: ", error);

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
