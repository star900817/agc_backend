const { CodeSharingTemplate } = require("../emailTemplate/CodeSharingTemplate");
const Order = require("../models/Order");
const User = require("../models/User");
const Bitaqty = require("../models/Bitaqty");
const Binance = require("../models/Binance");
const Collection = require("../models/Collection");

const nodemailer = require("nodemailer");

exports.getOrders = async (req, res) => {
  try {
    const orderData = await Order.find({ userId: req.user.id }).populate({
      path: "products.productId",
      populate: {
        path: "category", // Populate the category field inside the productId object
      },
    }).populate({
      path: "products.productId",
      populate: {
        path: "colection", // Populate the category field inside the productId object
      },
    });
    return res.status(200).json({
      code: 200,
      message: "Order fetched Successfully",
      data: orderData,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orderData = await Order.find()
      .populate("userId")
      .populate({
        path: "products.productId",
        populate: {
          path: "category", // Populate the category field inside the productId object
        },
      });
    return res.status(200).json({
      code: 200,
      success: true,
      message: "Order fetched Successfully",
      data: orderData,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.sendProductCodeEmail = async (req, res) => {
  try {
    const { email, productData, orderId } = req.body;

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
      productData: productData,
      transporter,
    });

    if (emailSent) {
      const changeRedeemCodeSharingStatus = await Order.findByIdAndUpdate(
        orderId,
        {
          isRedeemCodeShared: true,
        }
      );

      if (changeRedeemCodeSharingStatus) {
        return res.status(200).json({
          code: 200,
          success: true,
          message: "Email send success fully",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.confirmOrderPayment = async (req, res) => {
  try {

    const { orderId, userId } = req.body;
    console.log("confirmOrderPayment req body:", req.body);

    const successPayment = await Order.findOneAndUpdate(
      { orderId: orderId },
      { isPaymentSuccess: true }
    );

    if (!successPayment) {
      console.log("Something went wrong while updating order payment status");
      return res.status(300).json({
        code: 300,
        message: "Something went wrong while updating order payment status",
        success: false,
      });
    }

    await User.findByIdAndUpdate(userId, { cart: [] }); // Corrected line

    const user = await User.findById(userId);
    const newOrder = await Order.findOne({orderId: orderId});

    const emailData = [];
    const email = user.email;
console.log("confirmOrderPayment userEmail", email);
console.log("confirmOrderpayment newOrder:", newOrder);
    for (let i = 0; i < newOrder.products.length; i++) {
      if (newOrder.products[i].productType === 'binance') {
        const product = await Binance.findById(newOrder.products[i].productId);
        product.minQty -= newOrder.products[i].quantity;
        await product.save();

        const emailItem = {
          codeString: product.giftCards[0].code,
          productId: product._id,
          productImage: product.image,
          productName: product.title,
          productQty: newOrder.products[i].quantity,
          productSKU: product.giftCards[0].referenceNo
        };

        emailData.push(emailItem);
      }
    }
console.log("confirmPayment:", emailData);
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
console.log("Successfully sent email!");
      await Order.findOneAndUpdate(
        { orderId: orderId },
        { isRedeemCodeShared: true },
        { new: true }
      );
    }

    return res.status(200).json({
      code: 200,
      message: "Payment Successful",
      success: true
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};


exports.getOrdersByOrderId = async (req, res) => {
  try {
    const orderData = await Order.find({
      orderId: req.query.orderId,
    }).populate({
      path: "products.productId",
      populate: {
        path: "category", // Populate the category field inside the productId object
      },
    });

    return res.status(200).json({
      code: 200,
      message: "Order fetched Successfully",
      data: orderData,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.orderWebhookManager = async (req, res) => {
  try {
    const { OrderId, ...otherOrderData } = req.body;

    const updateOrderData = await Order.findOneAndUpdate(
      { orderId: OrderId },
      { webHookOrderData: otherOrderData }
    );

    if (updateOrderData) {
      return res.status(200).json({
        code: 200,
        message: "Order Data updated successfully",
        success: true,
      });
    } else {
      return res.status(300).json({
        code: 300,
        success: false,
        message: "Something went wrong while updating the order data",
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
