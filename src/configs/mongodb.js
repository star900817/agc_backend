const mongoose = require("mongoose");

exports.connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
    .catch((error) =>
      console.log("Error while connecting to mongodb: ", error.message),
    );
};
