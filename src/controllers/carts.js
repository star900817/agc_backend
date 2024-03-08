const User = require("../models/User");
const Bitaqty = require("../models/Bitaqty");
const Binance = require("../models/Binance");
const Categories = require("../models/Category");

exports.getCart = async (req, res) => {
  const id = req.params.id;
const result = []
  try {
    const user = await User.findById(id).populate("cart._id");

    for (let i = 0; i < user.cart.length; i++) {
      console.log("id", user.cart[i].id);
      let product;
      let category;
      if (user.cart[i].productType === "bitaqty") {
        console.log("1");
        product = await Bitaqty.findById(user.cart[i].id);
	category = await Categories.findById(product.category)
	console.log("category1", category.name)
	product.id = product._id
        product.totalPrice = product.price * user.cart[i].quantity;
	product.quantity = user.cart[i].quantity;
	product.productType = user.cart[i].productType
	product.categoryName = category.name
	
      } else {
        console.log("2");
        product = await Binance.findById(user.cart[i].id);
	category = await Categories.findById(product.category)
	console.log("category2", category.name)

	product.id = product._id
        product.totalPrice = product.price * user.cart[i].quantity;
	product.quantity = user.cart[i].quantity;
	product.productType = user.cart[i].productType
	product.categoryName = category.name
      }

      if (product) {
	const { _id, ...removedProduct } = product.toObject(); 
        const modifiedProduct = { id: product.id, productType: product.productType, quantity: product.quantity, categoryName: product.categoryName, productDescription: product.description?product.description:"", productDetails: product, totalPrice: product.totalPrice };
        result.push(modifiedProduct);

      } else {
        console.log(`Product with ID ${user.cart[i].id} not found.`);
      }
    }


    return res.status(200).json({
      code: 200,
      message: "Cart fetched successfully!",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};

// exports.addToCart = async (req, res) => {
//   const { id, productId } = req.body;
//   const quantity = req.body.quantity || 1;
//   try {
//     const cart = await User.findById(id).populate("cart.id");
//     if (!cart) {
//       const cartData = [{ id: productId, quantity }];
//       await User.findByIdAndUpdate(id, {
//         cart: cartData,
//         cartNum: cart.cartNum + 1,
//       })
//         .then((result) => {
//           return res.status(200).json({
//             code: 200,
//             message: "Cart updated successfully!",
//             data: result.cart,
//           });
//         })
//         .catch((error) => {
//           return res.status(400).json({ code: 400, message: error.message });
//         });

//     } else {
//       const find = cart.cart.find((item) => {
//         return item.id == productId;
//       });
//       if (find != null) {
//         find.quantity = quantity;
//         await User.findByIdAndUpdate(id, {
//           cart,
//           cartNum: cart.cartNum + 1,
//         }).then((result) => {
//           return res.status(200).json({
//             code: 200,
//             message: "Cart updated successfully!",
//             data: result.cart,
//           });
//         });
//       } else {
//         cart.cart.push({ id: productId, quantity });
//         await User.findByIdAndUpdate(id, {
//           cart: cart.cart,
//           cartNum: cart.cartNum + 1,
//         })
//           .then((result) => {
//             return res.status(200).json({
//               code: 200,
//               message: "Cart updated successfully!",
//               data: result.cart,
//             });
//           })
//           .catch((error) => {
//             return res.status(400).json({ code: 400, message: error.message });
//           });
//       }
//     }
//   } catch (error) {
//     return res.status(500).json({ code: 500, message: error.message });
//   }
// };

exports.addToCart = async (req, res) => {
  const { id, productId, productType } = req.body;
  const quantity = Number(req.body.quantity) || 1;

  try {
    let user = await User.findById(id);
    let productExists = false;

    for (let i = 0; i < user.cart.length; i++) {
      if (
        user.cart[i].id.toString() === productId &&
        user.cart[i].productType === productType
      ) {
        user.cart[i].quantity += quantity;
        productExists = true;
        break;
      }
    }
    
    let product;
    let category;

    if (!productExists) {
      
      if (productType === "binance") {
        product = await Binance.findById(productId);
	category = await Categories.findById(product.category)

      } else {
        product = await Bitaqty.findById(productId);
	category = await Categories.findById(product.category)

      }

      user.cart.push({
        id: productId,
        productType: productType,
        quantity: quantity,
	categoryName: category.name,
	productDescription: product.description?product.description: "",
        productDetails: product,
      });

    }

    user.totalQty += quantity;
    user.cartNum = user.cart.length;
    user = await user.save();

   console.log("----", user);

    if (!user) {
      return res.status(500).json({ code: 500, message: "Failed to save user." });
    }

    return res.status(200).json({
      code: 200,
      message: "Cart updated successfully!",
      Qty: user.totalQty,
      data: user.cart,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ code: 500, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const quantity = Number(req.body.quantity) || 1;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }

    const product = user.cart.find((product) => product.id.equals(productId));

    if (!product) {
      return res.status(400).json({ code: 400, message: 'Product not found in cart!' });
    }

    if (req.body.removeAll) {
	console.log("12")
      user.cart = user.cart.filter((item) => !item.id.equals(productId));
      user.totalQty -= product.quantity;
      user.cartNum -= product.quantity;


    } else {
      if (product.quantity === 1) {
        user.cart = user.cart.filter((item) => !item.id.equals(productId));
        user.totalQty -= 1;
        user.cartNum -= 1;
      } else {
        product.quantity -= quantity;
        user.totalQty -= quantity;
        user.cartNum -= quantity;
      }
    }

    await user.save();
    return res.status(200).json({
      code: 200,
      message: 'Item(s) removed from cart successfully!',
      Qty: user.totalQty,
      data: user.cart,
    });
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};