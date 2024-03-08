const jwt = require("jsonwebtoken");

exports.generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

exports.generateAdminAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

exports.generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.verifyToken = (token) => {
  const decoded = jwt.verify(`${token}`, process.env.REFRESH_JWT_SECRET);

  return decoded;
};
