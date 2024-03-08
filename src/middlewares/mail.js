const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.NODEMAILTER_HOST,
  port: process.env.NODEMAILTER_PORT,
  secure: true,
  auth: {
    user: process.env.NODEMAILTER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

function sendEmail(to, subject, text) {
  console.log(to);
  const mailOptions = {
    from: process.env.NODEMAILTER_USER,
    to: to,
    subject,
    text,
    replyTo: to,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
}

module.exports = {
  sendEmail,
};
