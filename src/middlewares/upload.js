const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname == "cardslider") {            
      const imageDir = path.join(__dirname, "..", "public", "CMS","cardslider");
      if (fs.existsSync(imageDir)) {
        cb(null, imageDir);
      } else {
        fs.mkdirSync(imageDir, { recursive: true });
        cb(null, imageDir);
        }
    }
    else if (file.fieldname == "partnerlogo") {            
      const imageDir = path.join(__dirname, "..", "public", "CMS","partnerlogo");
      if (fs.existsSync(imageDir)) {
        cb(null, imageDir);
      } else {
        fs.mkdirSync(imageDir, { recursive: true });
        cb(null, imageDir);
        }
    }
    else{
      const filePath = path.join(__dirname, "..", "public", "images");
      if (fs.existsSync(filePath)) {
        cb(null, filePath);
      } else {
        fs.mkdirSync(filePath, { recursive: true });
        cb(null, filePath);
      }
    }  
  },
  filename: function (req, file, cb) {
    console.log(path.extname(file.originalname), "log of file");
    cb(
      null,
      !path.extname(file.originalname)
        ? file.fieldname + "-" + Date.now() + ".png"
        : file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

exports.upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    callback(null, true);
  },
});
