const cron = require("node-cron");
const Order = require("../models/Order");
const BestSelling = require("../models/BestSelling");

const getBestSelling = async () => {
  try {
    let tempBestSellingProducts = [];
    const orders = await Order.find({ isPaymentSuccess: true });

    orders.forEach((order) => {
      order.products.forEach((product) => {
        let productId = product.productId.toString();

        let found = false;
        tempBestSellingProducts.forEach((tempProd) => {
          if (tempProd.productId === productId) {
            tempProd.purchaseCount += product.quantity;
            found = true;
          }
        });

        if (!found) {
          tempBestSellingProducts.push({
            productId: productId,
            purchaseCount: product.quantity,
          });
        }
      });
    });

    const existingBestSelling = await BestSelling.findOne();
    if (existingBestSelling) {
      existingBestSelling.bestSelling = tempBestSellingProducts;
      await existingBestSelling.save();
    } else {
      const newBestSelling = new BestSelling({
        bestSelling: tempBestSellingProducts,
      });

      await newBestSelling.save();
    }
  } catch (error) {
    console.log(error.message);
  }
};

cron.schedule("* * * * *", getBestSelling);
