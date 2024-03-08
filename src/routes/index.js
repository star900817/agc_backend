const authRouter = require("./users");
const collectionRouter = require("./collections");
const categoryRouter = require("./categories");
const companyRouter = require("./companies");
const giftRouter = require("./gifts");
const giftCardsRouter = require("./giftCards");
const paymentsRouter = require("./payments");
const orderRouter = require("./order");
const cmsRouter = require("./cms")
const faqsRouter = require("./faqs")

module.exports = (app) => {
  // Home route
  app.get("/", (_, res) => {
    res.status(200).send("Welcome to arab-gift-cards Backend API");
  });

  app.use("/api", authRouter);
  app.use("/api", collectionRouter);
  app.use("/api", categoryRouter);
  app.use("/api", companyRouter);
  app.use("/api", giftRouter);
  app.use("/api", orderRouter);
  app.use("/api/gift-cards", giftCardsRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/cms", cmsRouter);
  app.use("/api/faqs", faqsRouter);
};
