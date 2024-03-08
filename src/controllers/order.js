const { CodeSharingTemplate } = require("../emailTemplate/CodeSharingTemplate");
const Order = require("../models/Order");
const User = require("../models/User");

const nodemailer = require("nodemailer");

exports.getOrders = async (req, res) => {
  try {
    const orderData = await Order.find({ userId: req.user.id }).populate({
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
	console.log("oderrrs", orderData[0].products)
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
    const successPayment = await Order.findOneAndUpdate(
      { orderId: orderId },
      {
        isPaymentSuccess: true,
      }
    );

    if (!successPayment)
      return res.status(300).json({
        code: 300,
        message: "Something went wrong while updating order payment status",
        success: false,
      });

    User.findByIdAndUpdate(userId, {
      cart: [],
    })
      .then(() => {
        return res
          .status(200)
          .json({ code: 200, message: "Payment Successful", success: true });
      })
      .catch((error) => {
        return res.status(400).json({
          success: false,
          data: error.message,
        });
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
