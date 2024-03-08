const User = require("../models/User.js");
const bitaQty = require("../models/Bitaqty.js");
const Bitaqty = require("../models/Bitaqty");
const Binance = require("../models/Binance");
const Categories = require("../models/Category");

exports.getWishlist = async (req, res) => {
  const result = []
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    const wishlist = user.wishlist
	console.log(user, "user")
    for(let i = 0; i < wishlist.length; i++) {
	let product;
	let category;
	if(wishlist[i].itemType === 'binance') {
	  product = await Binance.findById(wishlist[i].item)
	} else {
	  product = await Bitaqty.findById(wishlist[i].item)
	}
	category = await Categories.findById(product.category)
	const updatedProduct = {productDetails: product, categoryName: category.name}
	if(updatedProduct) {
	  result.push(updatedProduct)
	} else {
	  console.log(`Product with ID ${wishlist[i].id} not found.`);
	}
    }
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "Wishlist not found!",
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "Wishlist fetched successfully!",
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// exports.getWishlist = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const wishlist = await User.findById(id).select('wishlist')
//     let productArray = []
//     await wishlist.wishlist.map((D)=>{
//       productArray.push(String(D.item))
//     })
//     const allWishlistProduct = await bitaQty.find({_id: {$in: productArray}})
//     if (!allWishlistProduct) {
//       return res.status(404).json({
//         code: 404,
//         message: "Wishlist not found!",
//       });
//     }else{
//       return res.status(200).json({
//         code: 200,
//         message: "Wishlist fetched successfully!",
//         data: allWishlistProduct,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({ code: 500, message: error.message });
//   }
// };

exports.addToWishlist = async (req, res) => {
  const { id, productId, productType } = req.body;
  try {
    let user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    if (user.wishlist.length < 1) {
      let wishlistData = { item: productId, itemType: productType };
      user.wishlist.push(wishlistData);
      user.wishlistNum += 1;
      user = await user.save();
	if(productType === 'binance') {
	  product = await Binance.findById(productId)
	} else {
	  product = await Bitaqty.findById(productId)
	}
	category = await Categories.findById(product.category)
	const updatedProduct = {productDetails: product, categoryName: category.name}
	console.log("adsfa:", updatedProduct)
	
      return res.status(200).json({
	code: 200,
	message: "Wishlist updated successfully!",
	data: updatedProduct	
      });
	        
    } else {
      const find = user.wishlist.find((product) => product.item.equals(productId))
      if (find) {
        return res
          .status(300)
          .json({ code: 300, message: "Product already in wishlist" });
      } else {
        let wishlistData = { item: productId, itemType: productType };
        user.wishlist.push(wishlistData);
	user.wishlistNum += 1;
	user = await user.save();
	let product;
	let category;
	const result = [];
	for(let i = 0; i < user.wishlist.length; i++) {
	  if(user.wishlist[i].itemType === "binance") {
	    product = await Binance.findById(user.wishlist[i].item)
	  } else {
	    product = await Bitaqty.findById(user.wishlist[i].item)
	  }
	  category = await Categories.findById(product.category)
	  const updatedProduct = {productDetails: product, categoryName: category.name}
	console.log("adsfa:", updatedProduct)
	result.push(updatedProduct)
	}


	return res.status(200).json({
	  code: 200,
	  message: "Wishlist updated successfully!",
	  data: result	
 	});

      }
    }
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    const user = await User.findById(userId);
    const product = user.wishlist.find((product) => product.item.equals(productId));

    if(!product) {
	return res.status(400).json({code: 400, message: 'Product not found in wishlist!'});	
    } else {
	user.wishlist = user.wishlist.filter((product) => !product.item.equals(productId));
	user.wishlistNum -= 1;
    }
    
    await user.save();
	let restProduct;
	let category;
	const result = [];
	for(let i = 0; i < user.wishlist.length; i++) {
	  if(user.wishlist[i].itemType === "binance") {
	    restProduct = await Binance.findById(user.wishlist[i].item)
	  } else {
	    restProduct = await Bitaqty.findById(user.wishlist[i].item)
	  }
	  category = await Categories.findById(restProduct.category)
	  const updatedProduct = {productDetails: restProduct, categoryName: category.name}
	console.log("adsfa:", updatedProduct)
	result.push(updatedProduct)
	}

    return res.status(200).json({
      code: 200,
      message: 'Item removed from wishlist successfully!',
      Qty: user.wishlistNum,
      data: result,
    });    
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
