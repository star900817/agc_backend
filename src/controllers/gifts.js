const Gifts = require("../models/Gift");
const User = require("../models/User");
const Bitaqty = require("../models/Bitaqty");
const axios = require("axios");
const crypto = require("crypto");
const Binance = require("../models/Binance");
const BestSelling = require("../models/BestSelling");
const Collection = require("../models/Collection");

const {
  createGiftCardCode,
  buyGiftCardCode,
  verifyGiftCardCode,
  redeemGiftCardCode,
} = require("../services/binance");

exports.getGifts = async (req, res) => {
  try {
    const companyId = req.params.coId;
    const categoryId = req.params.caId;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = offset * limit;
    var sort = req.query.sort;
    var gifts;
    var totalPages;
    const totalItems = await Gifts.countDocuments({
      companyId: companyId,
      categoryId: categoryId,
    });
    if (sort == "asc") {
      gifts = await Gifts.find({ companyId: companyId, categoryId: categoryId })
        .skip(skip)
        .limit(limit)
        .sort({ price: 1 })
        .populate({ path: "companyId", path: "categoryId" });
      totalPages = Math.ceil(totalItems / limit);
    } else if (sort == "desc") {
      gifts = await Gifts.find({ companyId: companyId, categoryId: categoryId })
        .skip(skip)
        .limit(limit)
        .sort({ price: -1 })
        .populate({ path: "companyId", path: "categoryId" });
      totalPages = Math.ceil(totalItems / limit);
    } else if (sort == "lat") {
      gifts = await Gifts.find({ companyId: companyId, categoryId: categoryId })
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .populate({ path: "companyId", path: "categoryId" });
      totalPages = Math.ceil(totalItems / limit);
    } else {
      gifts = await Gifts.find({ companyId: companyId, categoryId: categoryId })
        .skip(skip)
        .limit(limit)
        .populate({ path: "companyId", path: "categoryId" });
      totalPages = Math.ceil(totalItems / limit);
    }
    if (!gifts) {
      return res.status(404).json({
        code: 404,
        message: "Gifts not found!",
      });
    }
    return res.status(200).json({
      code: 200,
      message: "Gifts fetched successfully!",
      data: gifts,
      totalItems: totalItems,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getGiftsByCollection = async (req, res) => {
  try {
    if (req.params.collectionName === "newArrival") {
      Bitaqty.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Product fetch successfully",
            data: result,
          });
        })
        .catch((err) => {
          return res.status(400).json({
            code: 400,
            message: err.message,
          });
        });
    } else if (req.params.collectionName === "bestSelling") {
      BestSelling.find()
        .populate("bestSelling.productId")
        .limit(6)
        .then((response) => {
          const sortedArray = response[0].bestSelling.sort(
            (a, b) => b.purchaseCount - a.purchaseCount
          );

          const productsInDescendingOrder = sortedArray.map(
            (item) => item.productId
          );

          return res.status(200).json({
            code: 200,
            message: "Product fetch successfully",
            data: productsInDescendingOrder,
          });
        })
        .catch((err) => {
          return res.status(400).json({
            code: 400,
            message: err.message,
          });
        });
    } else {
      Bitaqty.find({ productCollection: req.params.collectionName })
        .sort({ createdAt: -1 })
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Product fetch successfully",
            data: result,
          });
        })
        .catch((err) => {
          return res.status(400).json({
            code: 400,
            message: err.message,
          });
        });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getBinanceGifts = async (req, res) => {
  try {
    Binance.find()
      .populate("colection")
      .populate("category")
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Binance card fetch successfully",
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

exports.addBinanceGifts = async (req, res) => {
  try {
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }

    let Image;
    req.file ? (Image = `images/${req.file.filename}`) : null;


    let { price, isDualToken, baseToken, faceToken, minQty} = req.body;

    if (typeof baseToken === 'undefined') {
      baseToken = 'USDT';
    }

    if (typeof isDualToken === 'undefined') {
      isDualToken = 'false';
    }
    
    let giftCards = [];
    for (let i = 0; i < parseInt(minQty); i++) {
      let giftCard;
      if (isDualToken === 'true') {        
        giftCard = await buyGiftCardCode(baseToken, faceToken, price);
      } else {
        giftCard = await createGiftCardCode(baseToken, price);
      }
      giftCards.push(giftCard.data)
    }

    new Binance({
      ...req.body,
      giftCards,
      ...(Image && { image: Image }),
    })
      .save()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Binance Card added successfully",
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
    console.log(error)
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.addBitaqtyGifts = async (req, res) => {
  try {
    const { productDetails, priceInSAR, description } = req.body;
    if (!productDetails) {
      return res
        .status(400)
        .json({ code: 400, message: "Please enter all valid fields" });
    }
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    // if (findAdmin?.role != "admin") {
    //   return res.status(404).json({
    //     code: 404,
    //     message: "You can't access this!",
    //   });
    // }
    let Image;
    req.file ? (Image = `images/${req.file.filename}`) : null;
    const proDetails = JSON.parse(req?.body?.productDetails);
    const existBitaqty = await Bitaqty.findOne({
      "productDetails.productID": proDetails?.productID,
    });
    if (existBitaqty) {
      return res.status(409).json({
        code: 409,
        message: "Card is already exist!",
      });
    }
    new Bitaqty({
      productDetails: proDetails,
      price: Number(req.body.price),
      priceInSAR: priceInSAR,
      description: description,
      image: Image,
      ...(req.body?.colection&& {
        colection: req.body?.colection,
      }),      
      ...(req.body.category && {
        category: req.body.category,
      }),
      ...(req.body.subCategory && {
        subCategory: req.body.subCategory,
      }),
      ...(req.body.isFeatured === "true" && {
        productCollection: "featured",
      }),
    })
      .save()
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Card added successfully",
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

exports.updateBinanceGifts = async (req, res) => {
  try {
    const { cardId, ...otherDetails } = req.body;
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    const existBinance = await Binance.findById(cardId);
    if (!existBinance) {
      return res.status(409).json({
        code: 409,
        message: "Card is not exist!",
      });
    }

    let Image = null;
    req.file ? (Image = `images/${req.file.filename}`) : null;

    try {
    for (let i = 0; i < existBinance.giftCards.length; i++) {
      let giftCard = existBinance.giftCards[i];
      try {
      	await redeemGiftCardCode(giftCard.code);
      } catch (error) {
      	console.error('Caught an error:', error.message);
      }
    }
    } catch (error) {
	console.error(error);
    }

    let { price, isDualToken, baseToken, faceToken, minQty} = req.body;
    if (typeof baseToken === 'undefined') {
      baseToken = 'USDT';
    }

    if (typeof isDualToken === 'undefined') {
      isDualToken = 'false';
    }
    
    let giftCards = [];
    for (let i = 0; i < parseInt(minQty); i++) {
      let giftCard;
      if (isDualToken === 'true') {
        giftCard = await buyGiftCardCode(baseToken, faceToken, price);
      } else if(isDualToken === 'false') {
        giftCard = await createGiftCardCode(baseToken, price);
      }
      giftCards.push(giftCard.data)
    }
    Binance.findByIdAndUpdate(
      existBinance._id,
      {
        ...otherDetails,
        ...(Image && { image: Image }),
        ...(req.body.category && {
          category: req.body.category,
        }),
        ...(req.body.subCategory && {
          subCategory: req.body.subCategory,
        }),
        giftCards,
      },
      { new: true }
    )
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Binance Card updated successfully",
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

exports.updateBitaqtyGifts = async (req, res) => {
  try {
    const { productDetails, cardId } = req.body;
console.log(req.body.subCategory)
    if (!productDetails) {
      return res
        .status(400)
        .json({ code: 400, message: "Please enter all valid fields" });
    }
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    // if (findAdmin?.role != "admin") {
    //   return res.status(404).json({
    //     code: 404,
    //     message: "You can't access this!",
    //   });
    // }
    const proDetails = JSON.parse(req?.body?.productDetails);
    // console.log("proDetails", proDetails);
    // console.log("proDetails", proDetails.priceInSAR);
    const existBitaqty = await Bitaqty.findById(cardId);
    if (!existBitaqty) {
      return res.status(409).json({
        code: 409,
        message: "Card is not exist!",
      });
    }
    const similarBitaqty = await Bitaqty.findOne({
      "productDetails.productID": proDetails?.productID,
      _id: { $ne: existBitaqty._id },
    });
    if (similarBitaqty) {
      return res.status(409).json({
        code: 409,
        message: "Card is already exist!",
      });
    }
    let Image;
    req.file ? (Image = `images/${req.file.filename}`) : null;
    Bitaqty.findByIdAndUpdate(
      existBitaqty._id,
      {
        productDetails: proDetails,
        price: Number(req.body.price),
        priceInSAR: Number(proDetails.priceInSAR),
        image: Image,
        ...(req.body?.colection&& {
        colection: req.body?.colection,
      }),        
        ...(req.body.category && {
          category: req.body.category,
        }),
        subCategory: req.body.subCategory,      },
      { new: true }
    )
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Card updated successfully",
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

exports.deleteBinanceGifts = async (req, res) => {
  try {
    const { cardId } = req.query;
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }

    const existBinance = await Binance.findById(cardId);
    if (!existBinance) {
      return res.status(409).json({
        code: 409,
        message: "Card is not exist!",
      });
    }

    try {
    for (let i = 0; i < existBinance.giftCards.length; i++) {
      let giftCard = existBinance.giftCards[i];
      try {
      	await redeemGiftCardCode(giftCard.code);
      } catch (error) {
      	console.error('Caught an error:', error.message);
      }
    }
    } catch (error) {
	console.error(error);
    }

    Binance.findByIdAndDelete(existBinance._id)
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Binance Card deleted successfully",
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

exports.deleteBitaqtyGifts = async (req, res) => {
  try {
    const { cardId } = req.query;
    const findAdmin = await User.findById(req.user.id);
    if (!findAdmin) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }
    // if (findAdmin?.role != "admin") {
    //   return res.status(404).json({
    //     code: 404,
    //     message: "You can't access this!",
    //   });
    // }
    const existBitaqty = await Bitaqty.findById(cardId);
    if (!existBitaqty) {
      return res.status(409).json({
        code: 409,
        message: "Card is not exist!",
      });
    }
    Bitaqty.findByIdAndDelete(existBitaqty._id)
      .then((result) => {
        return res.status(200).json({
          code: 200,
          message: "Card deleted successfully",
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

exports.getBitaqtyGifts = async (req, res) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getBinanceAdvanced = async (req, res) => {
  try {
    res.status(200).json(res.advancedResults);
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

/**
 * @desc    Get all Gift cards (bitaqty + Binance)
 * @route   GET /api/gift-cards
 * @access  Private
 */

exports.getAllGiftCards = async (req, res) => {
  try {
    const gifts = await Bitaqty.find().populate("colection");

    if (!gifts) {
      return res.status(404).json({
        code: 404,
        message: "Bitaqty Gifts not found!",
      });
    }

    return res.status(200).json({
      code: 200,
      message: "Bitaqty Gifts fetched successfully!",
      data: gifts,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ code: 500, message: err.message });
  }
};

exports.getSearchProducts = async (req, res) => {
  try {
    console.log("aaaaaaaaaaaaaaaa")
    const categoryId = req.query.categoryId;
    const subCategoryId = req.query.subCategoryId;
    const collectionId = req.query.collectionId;
    const limit = parseInt(req.query.limit);

    let searchText = req.query.searchText;

    let query = {};
    if (categoryId) {
	query['category'] = categoryId;
    }
console.log("bbbbb", searchText)
    if (subCategoryId) {
	query['subCategory'] = subCategoryId;
    }

    if (collectionId) {
	query['colection'] = collectionId;
    }

    if (searchText) {
const escapedSearchText = searchText.replace(/[$]/g, "\\$");
	query['$or'] = [{
	  'productDetails.nameEn' : {
	    $regex: escapedSearchText,
            $options: 'i',
	  }
	}, {
	  'title' : {
	    $regex: escapedSearchText,
            $options: 'i',
	  }
	}]	
    }

    console.log(query, 'query');

    if (limit) {
	const bitaqties = await Bitaqty.find(query).limit(limit);
	const binances = await Binance.find(query).limit(limit);
console.log("111")
	return res.status(200).json({
          code: 200,
          message: "Product fetched successfully!",
          dataLength: (bitaqties.length + binances.length),
          data: [...bitaqties, ...binances],
        });
    } else {
console.log("22")
	const bitaqties = await Bitaqty.find(query);
	const binances = await Binance.find(query).populate('category');
console.log(binances, "binances")
	return res.status(200).json({
          code: 200,
          message: "Product fetched successfully!",
          dataLength: (bitaqties.length + binances.length),
          data: [...bitaqties, ...binances],
        });
    }

    

    const products = await Binance.find();
//    const modifiedProducts = [];
//    for(let i = 0; i < products.length; i++) {
//	const collection = await Collection.findById(products[i]);
//	const updatedProduct = {...products[i], collectionName: collection.name}
//	modifiedProducts.push(updatedProduct)
//  }

    if (!products ) {
      return res.status(404).json({
        code: 404,
        message: "Bitaqty Gifts not found!",
      });
    } else {
console.log("hereadf")
      let newDataArray = [];
      if (products ?.length > 0) {
        await products .filter((pro) => {
          const productName = pro?.productDetails?.nameEn
            ?.replace(/\s/g, "")
            .toLowerCase();
          if (productName.includes(searchText)) {
            newDataArray.push(pro);
          }
        });
      }
	
      return res.status(200).json({
        code: 200,
        message: "Bitaqty Gifts fetched successfully!",
        dataLength: newDataArray.length,
        data: newDataArray,
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.createGift = async (req, res) => {
  try {
    const { uId, name, categoryId, companyId, price, description } = req.body;
    const findAdmin = await User.findById(uId);
    if (findAdmin.role == "admin") {
      var file = req?.file?.filename;
      var image = "images/" + file;
      const gift = new Gifts({
        companyId,
        categoryId,
        name,
        price,
        description,
        image,
      });
      await gift
        .save()
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Gift created successfully!",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.editGift = async (req, res) => {
  const { uId, cId, name, categoryId, companyId, price, description } =
    req.body;
  var file = req?.file?.filename;
  var image = "images/" + file;
  try {
    const findAdmin = await User.findById(uId);
    if (findAdmin.role == "admin") {
      if (file == undefined) {
        await Gifts.findByIdAndUpdate(cId, {
          companyId,
          categoryId,
          name,
          price,
          description,
        })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Company updated successfully!",
              data: result,
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
      } else {
        await Gifts.findByIdAndUpdate(cId, {
          companyId,
          categoryId,
          name,
          price,
          description,
          image,
        })
          .then((result) => {
            return res.status(200).json({
              code: 200,
              message: "Company updated successfully!",
              data: result,
            });
          })
          .catch((error) => {
            return res.status(400).json({ code: 400, message: error.message });
          });
      }
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.deleteGift = async (req, res) => {
  const { uId, gId } = req.body;
  try {
    const findAdmin = await User.findById(uId);
    if (findAdmin.role == "admin") {
      await Gifts.findByIdAndDelete(gId)
        .then((result) => {
          return res.status(200).json({
            code: 200,
            message: "Gift deleted successfully!",
            data: result,
          });
        })
        .catch((error) => {
          return res.status(400).json({ code: 400, message: error.message });
        });
    } else {
      return res.status(403).json({ code: 403, message: "You are not Admin" });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getSpecificGift = async (req, res) => {
  try {
    const id = req.params.id;
    await Gifts.findById(id)
      .populate({ path: "categoryId", path: "companyId" })
      .then((result) => {
        return res.status(200).json({ code: 200, data: result });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.searchGift = async (req, res) => {
  try {
    const search = req.query.search;
    const companyId = req.params.coId;
    const categoryId = req.params.caId;
    await Gifts.find({
      $and: [
        { companyId: companyId },
        { categoryId: categoryId },
        { name: { $regex: search, $options: "i" } },
      ],
    })
      .then((result) => {
        return res.status(200).json({ code: 200, data: result });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err });
      });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getBitaqatyGiftCards = async (req, res) => {
  try {
    const password = crypto.createHash("md5");
    password.update(
      process.env.RESELLER_USERNAME + process.env.BITAQATY_SECRET_KEY
    );
    const payload = {
      resellerUsername: process.env.RESELLER_USERNAME,
      merchantId: "",
      password: password.digest("hex"),
    };

    axios
      .post(
        process.env.CORE_URL_BITAQATY + "/integration/detailed-products-list",
        payload
      )
      .then((response) => {
        res.status(200).json({ code: 200, data: response.data.products });
      })
      .catch((err) => {
        res.status(400).json({ code: 400, message: err });
      });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

exports.getBitaqatySingleGiftCard = async (req, res) => {
  try {
    const productId = req.params.id;
    const password = crypto.createHash("md5");
    password.update(
      process.env.RESELLER_USERNAME +
        productId +
        process.env.BITAQATY_SECRET_KEY
    );
    const payload = {
      resellerUsername: process.env.RESELLER_USERNAME,
      password: password.digest("hex"),
      productID: productId,
    };
    CO;
    axios
      .post(
        process.env.CORE_URL_BITAQATY + "/integration/product-detailed-info",
        payload
      )
      .then((response) => {
        console.log(response.data, "RES");
        return res.status(200).json({ code: 200, data: response.data.product });
      })
      .catch((err) => {
        return res.status(400).json({ code: 400, message: err });
      });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

// exports.buyBitaqatyGiftCard = async (req, res) => {
//   try {

//   } catch (error) {
//     return res.status(500).json({ code: 500, message: error.message });
//   }
// }
