const AWS = require("aws-sdk");

// Initialize AWS SDK with your configured credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Create an SNS object
exports.sns = new AWS.SNS();
