const validator = require("validator");
const { sendOtp } = require("../services/aws.js");
const {
  generateAccessToken,
  generateRefreshToken,
  generateAdminAccessToken,
} = require("../services/jwt.js");
const { hashPassword, matchPassword } = require("../services/bcrypt.js");
const { generateOtp } = require("../services/otp.js");
const User = require("../models/User.js");
const Otp = require("../models/Otp.js");
const { OTP_EXPIRES_IN_MILLISECONDS } = require("../utils/constants.js");
const { sendEmail } = require("../middlewares/mail.js");
const { generateRandomString } = require("../utils/generateRandomString.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {
  ForgotPasswordEmailTemplate,
} = require("../emailTemplate/forgetPasswordEmailTemplate.js");
const { sendOptOnPhone } = require("../middlewares/sendOtpOnPhone.js");
const strongPassword = new RegExp(
  "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,20})"
);

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.signUp = async (req, res) => {
  try {
    let { email, password, phoneNumber } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(422).json({
        code: 422,
        message: "Please enter a valid email address !",
      });
    }

    // if (!strongPassword.test(password.trim())) {
    //   return res.status(422).json({
    //     code: 422,
    //     message:
    //       "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
    //   });
    // }
    const user = await User.findOne({ email }).lean().exec();
    const userWithPhone = await User.findOne({ phoneNumber }).lean().exec();
    if (user) {
      return res.status(409).json({
        code: 409,
        message:
          "The email address you entered is already associated with another account!",
      });
    }
    if (userWithPhone) {
      return res.status(409).json({
        code: 409,
        message:
          "The phone number you entered is already associated with another account!",
      });
    }
    let otp = await generateOtp();
    const hashedPassword = await hashPassword(password);
    new User({
      ...req.body,
      statusOrResidenceNumber: Number(req.body.statusOrResidenceNumber),
      password: hashedPassword,
    })
      .save()
      .then(async (result) => {
        let hashOtp = await hashPassword(otp);
        if (!phoneNumber.startsWith("+")) {
          phoneNumber = "+966" + phoneNumber;
        }
        let oldOtp = await Otp.find({ phoneNumber });
        if (oldOtp.length > 0) {
          await Otp.deleteMany({ phoneNumber });
        }
        // sendOtp(otp, phoneNumber, email)
        sendEmail(
          email,
          "Verification OTP",
          `Please enter this OTP to verify your account : ${otp}`
        );

        const { success, message, data } = await sendOptOnPhone(
          phoneNumber,
          `Arab giftCard verification OTP: ${otp}`
        );

        if (success) {
          await new Otp({
            phoneNumber: phoneNumber,
            otp: hashOtp,
          })
            .save()
            .then(() => {
              return res.status(200).json({
                code: 200,
                message: "OTP Sent successfully!",
              });
            });
        } else {
          return res.status(300).json({
            code: 300,
            message:
              "The number seems not to valid in Saudi Arabia. Please enter valid number.",
          });
        }
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err });
      })
      .catch((err) => {
        return res.status(400).json({
          code: 400,
          message: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.signUpForAdmin = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(422).json({
        code: 422,
        message: "Please enter a valid email address !",
      });
    }

    // if (!strongPassword.test(password.trim())) {
    //   return res.status(422).json({
    //     code: 422,
    //     message:
    //       "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
    //   });
    // }
    const user = await User.findOne({ email }).lean().exec();
    const userWithPhone = await User.findOne({ phoneNumber }).lean().exec();
    if (user) {
      return res.status(409).json({
        code: 409,
        message:
          "The email address you entered is already associated with another account!",
      });
    }
    if (userWithPhone) {
      return res.status(409).json({
        code: 409,
        message:
          "The phone number you entered is already associated with another account!",
      });
    }
    const hashedPassword = await hashPassword(password);
    new User({
      ...req.body,
      role: "admin",
      auth: true,
      password: hashedPassword,
    })
      .save()
      .then(async (result) => {
        return res.status(200).send({
          success: true,
          message: "Successfully created admin account",
        });
      })
      .catch((err) => {
        return res.status(400).json({
          code: 400,
          message: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+966" + phoneNumber;
    }
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    if (user.auth) {
      return res.status(200).json({
        code: 200,
        message: "User already verified!",
      });
    }
    const getOtp = await Otp.findOne({ phoneNumber }).lean().exec();
    if (!getOtp) {
      return res.status(404).json({
        code: 404,
        message: "OTP expired. Please try again",
      });
    }
    const storedHashedOTP = getOtp.otp;
    const createdAt = new Date(getOtp.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const isOTPValid = await matchPassword(otp, storedHashedOTP);

    if (isOTPValid && timeDifference <= OTP_EXPIRES_IN_MILLISECONDS) {
      User.findOneAndUpdate(
        { phoneNumber },
        { $set: { auth: true } },
        { new: true }
      )
        .then((result) => {
          Otp.deleteMany({ phoneNumber }).then(() => {
            return res.status(200).json({
              code: 200,
              message: "User verified successfully!",
            });
          });
        })
        .catch((error) => {
          return res.status(400).json({
            code: 400,
            message: error.message,
          });
        });
    } else {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP or OTP has expired",
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    await Otp.deleteMany({ phoneNumber }).lean().exec();
    const otp = await generateOtp();
    const hashOtp = await hashPassword(otp);
    let oldOtp = await Otp.find({ phoneNumber });
    if (oldOtp.length > 0) {
      await Otp.deleteMany({ phoneNumber });
    }
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+966" + phoneNumber;
    }

    const { success, message, data } = await sendOptOnPhone(
      phoneNumber,
      `Arab giftCard verification OTP: ${otp}`
    );
    if (success) {
      sendOtp(otp, phoneNumber)
        .then(async () => {
          new Otp({
            phoneNumber: phoneNumber,
            otp: hashOtp,
          })
            .save()
            .then(() => {
              return res.status(200).json({
                code: 200,
                message: "OTP Sent successfully!",
              });
            });
        })
        .catch((err) => {
          return res.status(400).json({ code: 400, message: err });
        });
    } else {
      return res.status(300).json({
        code: 300,
        message:
          "The number seems not to valid in Saudi Arabia. Please enter valid number.",
      });
    }
  } catch (error) {
    console.log(error, "...");
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.signIn = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    // const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const validateEmail = (email) => {
      return email.match(emailRegex);
    };
    const isEmail = validateEmail(emailOrPhone);
    let userExistence;
    if (isEmail) {
      userExistence = await User.findOne({ email: emailOrPhone });
    } else {
      userExistence = await User.findOne({ phoneNumber: emailOrPhone });
    }
    if (!userExistence) {
      return res.status(401).json({
        code: 401,
        message: "User not found!",
      });
    }

    if (userExistence?.loginWithSocial) {
      return res.status(401).json({
        code: 401,
        message: "Please Login with Social Media -As you did earlier.",
      });
    }
    const compare = await matchPassword(password, userExistence.password);
    if (!compare) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid credentials!" });
    }

    if (userExistence.auth === false) {
      return res.status(404).json({
        code: 404,
        message: "User not verified, Please verify first!",
      });
    }

    const accessToken = generateAccessToken(userExistence._id);
    const refreshToken = generateRefreshToken(userExistence._id);
    return res.status(200).json({
      code: 200,
      message: "User logged in successfully !",
      accessToken: accessToken,
      refreshToken: refreshToken,
      data: userExistence,
      expireTime: new Date(new Date().getTime() + 60 * 60 * 24 * 1000),
    });
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
};

exports.loginWithGoogle = async (req, res) => {
  try {
    const validateEmail = (email) => {
      return email.match(emailRegex);
    };
    const isEmail = validateEmail(req.body.email);
    let userExistence = null;

    if (isEmail) {
      userExistence = await User.findOne({ email: req.body.email });
      if (userExistence?.email) {
        const accessToken = generateAccessToken(userExistence._id);
        const refreshToken = generateRefreshToken(userExistence._id);
        return res.status(200).json({
          code: 200,
          message: "User logged in successfully !",
          accessToken: accessToken,
          refreshToken: refreshToken,
          data: userExistence,
          expireTime: new Date(new Date().getTime() + 60 * 60 * 24 * 1000),
        });
      } else {
        new User({ ...req.body }).save().then((result) => {
          const accessToken = generateAccessToken(result._id);
          const refreshToken = generateRefreshToken(result._id);
          return res.status(200).json({
            code: 200,
            message: "User logged in successfully !",
            accessToken: accessToken,
            refreshToken: refreshToken,
            data: result,
            expireTime: new Date(new Date().getTime() + 60 * 60 * 24 * 1000),
          });
        });
      }
    }
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
};

exports.signInByAdmin = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    // const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const validateEmail = (email) => {
      return email.match(emailRegex);
    };
    const isEmail = validateEmail(emailOrPhone);
    let userExistence;
    if (isEmail) {
      userExistence = await User.findOne({ email: emailOrPhone });
    } else {
      userExistence = await User.findOne({ phoneNumber: emailOrPhone });
    }
    if (!userExistence) {
      return res.status(401).json({
        code: 401,
        message: "User not found!",
      });
    }
    const compare = await matchPassword(password, userExistence.password);
    if (!compare) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid credentials!" });
    }

    const accessToken = generateAdminAccessToken(userExistence._id);
    return res.status(200).json({
      code: 200,
      message: "Admin logged in successfully !",
      accessToken: accessToken,
      success: true,
      data: userExistence,
    });
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
};

exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    if (user.auth == false) {
      return res.status(404).json({
        code: 404,
        message: "User not verified, Please verify first!",
      });
    }
    let otp = await generateOtp();

    let hashOtp = await hashPassword(otp);
    let oldOtp = await Otp.find({ phoneNumber });
    if (oldOtp.length > 0) {
      await Otp.deleteMany({ phoneNumber });
    }
    // sendOtp(otp, phoneNumber).then(async () => {
    //   new Otp({
    //     phoneNumber: phoneNumber,
    //     otp: hashOtp,
    //   })
    //     .save()
    //     .then(() => {
    //       return res.status(200).json({
    //         code: 200,
    //         message: "OTP Sent successfully!",
    //       });
    //     });
    // });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { phoneNumber, password, otp } = req.body;
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    if (user.auth == false) {
      return res.status(404).json({
        code: 404,
        message: "User not verified, Please verify first!",
      });
    }
    const getOtp = await Otp.findOne({ phoneNumber }).lean().exec();
    if (!getOtp) {
      return res.status(404).json({
        code: 404,
        message: "OTP expired. Please try again",
      });
    }
    const storedHashedOTP = getOtp.otp;
    const createdAt = new Date(getOtp.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const isOTPValid = await matchPassword(otp, storedHashedOTP);
    const hashedPassword = await hashPassword(password);
    if (isOTPValid && timeDifference <= OTP_EXPIRES_IN_MILLISECONDS) {
      if (!strongPassword.test(password.trim())) {
        return res.status(422).json({
          code: 422,
          message:
            "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
        });
      }
      User.findOneAndUpdate(
        { phoneNumber },
        { $set: { password: hashedPassword } },
        { new: true }
      )
        .then((result) => {
          Otp.deleteMany({ phoneNumber: phoneNumber }).then(() => {
            return res.status(200).json({
              code: 200,
              message: "Password Reset Successfully",
            });
          });
        })
        .catch((error) => {
          return res.status(400).json({
            code: 400,
            message: error.message,
          });
        });
    } else {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP or OTP has expired",
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
    const checkCurrentPassword = await matchPassword(
      currentPassword,
      user.password
    );
    if (!checkCurrentPassword) {
      return res
        .status(404)
        .json({ code: 404, message: "Current password is incorrect" });
    }
    if (!strongPassword.test(newPassword.trim())) {
      return res.status(422).json({
        code: 422,
        message:
          "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
      });
    }
    const hashpassword = await hashPassword(newPassword);
    User.findByIdAndUpdate(
      { _id: req.user.id },
      { $set: { password: hashpassword } },
      { new: true }
    )
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Password reset successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          code: 400,
          message: error.message,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    User.find({ role: { $ne: "customer" } })
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "User details fetched successfully!",
          data: result,
          success: true,
        });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err.message });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findById(id)
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "User details fetched successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getCustomerUser = async (req, res) => {
  try {
    User.find({ role: "customer" })
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "User details fetched successfully!",
          data: result,
          success: true,
        });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err.message });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, email, firstName, lastName, DOB, country, phoneNumber } =
      req.body;

    await User.findByIdAndUpdate(id, {
      email: email,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: DOB,
      nationality: country,
      phoneNumber: phoneNumber,
    })
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "User details updated successfully!",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({ code: 400, message: error.message });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.phoneNumberChangeOTP = async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+966" + phoneNumber;
    }
    await Otp.deleteMany({ phoneNumber }).lean().exec();
    const otp = await generateOtp();
    const hashOtp = await hashPassword(otp);
    let oldOtp = await Otp.find({ phoneNumber });
    if (oldOtp.length > 0) {
      await Otp.deleteMany({ phoneNumber });
    }
    sendOtp(otp, phoneNumber)
      .then(async () => {
        new Otp({
          phoneNumber: phoneNumber,
          otp: hashOtp,
        })
          .save()
          .then(() => {
            return res.status(200).json({
              code: 200,
              message: "OTP Sent successfully!",
              data: phoneNumber,
            });
          });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.changePhoneNumber = async (req, res) => {
  try {
    let { id, phoneNumber, otp } = req.body;
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+966" + phoneNumber;
    }
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    if (user.auth == false) {
      return res.status(404).json({
        code: 404,
        message: "User not verified, Please verify first!",
      });
    }
    const getOtp = await Otp.findOne({ phoneNumber }).lean().exec();
    if (!getOtp) {
      return res.status(404).json({
        code: 404,
        message: "OTP expired. Please try again",
      });
    }
    const storedHashedOTP = getOtp.otp;
    const createdAt = new Date(getOtp.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const isOTPValid = await matchPassword(otp, storedHashedOTP);

    if (isOTPValid && timeDifference <= OTP_EXPIRES_IN_MILLISECONDS) {
      User.findByIdAndUpdate(
        req.user.id,
        { $set: { phoneNumber: phoneNumber } },
        { new: true }
      )
        .then((result) => {
          Otp.deleteMany({ phoneNumber: phoneNumber }).then(() => {
            return res.status(200).json({
              code: 200,
              message: "Phone Number Edited successfully!",
            });
          });
        })
        .catch((error) => {
          return res.status(400).json({
            code: 400,
            message: error.message,
          });
        });
    } else {
      return res.status(400).json({
        code: 400,
        message: "Invalid OTP or OTP has expired",
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
exports.createUser = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(422).json({
        code: 422,
        message: "Please enter a valid email address !",
      });
    }

    if (!strongPassword.test(password.trim())) {
      return res.status(422).json({
        code: 422,
        message:
          "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
      });
    }
    const user = await User.findOne({ email }).lean().exec();
    const userWithPhone = await User.findOne({ phoneNumber }).lean().exec();
    if (user) {
      return res.status(409).json({
        code: 409,
        message:
          "The email address you entered is already associated with another account!",
      });
    }
    if (userWithPhone) {
      return res.status(409).json({
        code: 409,
        message:
          "The phone number you entered is already associated with another account!",
      });
    }
    const hashedPassword = await hashPassword(password);
    new User({ ...req.body, auth: true, password: hashedPassword })
      .save()
      .then(async (result) => {
        return res.status(200).send({
          success: true,
          message: "Successfully created user account",
          data: result,
        });
      })
      .catch((err) => {
        return res.status(400).json({
          code: 400,
          message: err.message,
        });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    // const { newData, oldData } = req.body;
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(422).json({
        code: 422,
        message: "Please enter a valid email address !",
      });
    }

    // if (!strongPassword.test(password.trim())) {
    //   return res.status(422).json({
    //     code: 422,
    //     message:
    //       "Please Enter Password 8 to 20 single-byte alphanumeric characters and symbols(-._@) !",
    //   });
    // }

    await User.findOneAndUpdate({ email: email }, { ...req.body })
      .then((response) => {
        return res.status(200).send({
          success: true,
          message: "Successfully updated password",
          data: response,
        });
      })
      .catch((error) => {
        return res.status(500).json({ code: 500, message: error.message });
      });

    // if (email !== oldData.email) {
    //   const user = await User.findOne({ email }).lean().exec();
    //   if (user) {
    //     return res.status(409).json({
    //       code: 409,
    //       message:
    //         "The email address you entered is already associated with another account!",
    //     });
    //   }
    // }

    // if (phoneNumber !== oldData.phoneNumber) {
    //   const userWithPhone = await User.findOne({ phoneNumber }).lean().exec();
    //   if (userWithPhone) {
    //     return res.status(409).json({
    //       code: 409,
    //       message:
    //         "The phone number you entered is already associated with another account!",
    //     });
    //   }
    // }

    // let hashedPassword = "";
    // if (!password.includes("$2a")) {
    //   hashedPassword = await hashPassword(password);
    // } else {
    //   hashedPassword = oldData.password;
    // }

    // const update = await User.findByIdAndUpdate(
    //   { _id: req.query.id },
    //   { ...newData, password: hashedPassword },
    //   { new: true }
    // ).exec();

    // if (!update) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: "Error while updating users",
    //   });
    // }

    // return res.status(200).send({
    //   success: true,
    //   message: "Successfully updated password",
    //   data: update,
    // });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    const remove = await User.findByIdAndDelete({ _id: id }).exec();

    if (!remove) {
      return res
        .status(500)
        .json({ code: 500, message: "Error while removing users" });
    }

    res.status(200).send({
      code: 200,
      success: true,
      message: "User successfully removed!",
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.contactUs = async (req, res) => {
  try {
    const { fullName, email, phoneNum, subject, message } = req.body;
    let text = `
      Full Name: ${fullName}
      Email: ${email}
      Phone: ${phoneNum}
      Message: ${message}
`;
    sendEmail(process.env.NODEMAILER_ARAB_CARD_EMAIL, subject, text);
    return res.status(200).json({
      code: 200,
      message: "Mail Sent successfully!",
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getForgetPassVerificationLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(300).json({ code: 300, message: "User not found!" });

    const newOTP = generateRandomString(6);
    const OTPSaved = await User.findOneAndUpdate(
      { email: email },
      {
        latestOTP: newOTP,
      }
    );

    if (!OTPSaved) {
      return res
        .status(300)
        .json({ code: 300, message: "OTP not generated please try again!" });
    }
console.log(newOTP, 'newOTP')
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILTER_HOST,
      port: process.env.NODEMAILTER_PORT,
      secure: true,
      auth: {
        user: process.env.NODEMAILTER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const emailLink = {
      user: `arabgiftcard.com/forgetPasswordHandlePage?otp=${newOTP}&email=${email}`,
      customer: `arabgiftcard.com/forgetPasswordHandlePage?otp=${newOTP}&email=${email}`,
      admin: `arabgiftcard.com/resetPassword?otp=${newOTP}&email=${email}`,
    };
console.log(emailLink)
    const emailSent = await ForgotPasswordEmailTemplate({
      to: email,
      from: process.env.NODEMAILTER_USER,
      subject: "Request for reset password",
      link: emailLink[user.role],
      transporter,
      role: user.role,
    });

    if (!emailSent) {
      return res.status(300).json({
        code: 300,
        message: "Verification email not sent! Please try again.",
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Email sent successfully. please check inbox.",
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.verifyOtpWithPasswordChange = async (req, res, next) => {
  try {
    const { otp, email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).json({ code: 404, message: 'User not exist' });

    if (user?.latestOTP !== otp) {
      return res.status(401).json({ code: 401, message: 'Incorrect OTP!' });
    }

    const currentTime = new Date();
    const lastUpdateTime = new Date(user.updatedAt);

    const timeDifferenceInMinutes = Math.abs(
      (currentTime - lastUpdateTime) / (1000 * 60)
    );

    const expirationTimeInMinutes = process.env.OTP_EXPIRATION_TIME || 10;

    if (timeDifferenceInMinutes > expirationTimeInMinutes) {
      return res.status(401).json({
        code: 401,
        message: 'OTP expired: Please generate a new OTP.',
      });
    }

    if (!password) {
      return res.status(400).json({ code: 400, message: 'New password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the new password

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        password: hashedPassword, // Use the hashed password
      }
    );

    await User.updateOne({ email: email }, { $unset: { latestOTP: 1 } });

    return res.status(200).json({
      code: 200,
      message: 'Password changed successfully',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};