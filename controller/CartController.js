const Product = require("../models/pruductModel");
const userdb = require("../models/usermodel");
const CARTMOD = require("../models/cartModel");
const Coupon= require('../models/CouponModel')

module.exports = {
  ShowCartPage: async (req, res) => {
    const userId = req.session.userId;
    try {
      let cartItems = await CARTMOD.findOne({ userId: userId });
      const user = req.session.user;
  
      if (!cartItems || !cartItems.cartProducts || cartItems.cartProducts.length === 0) {
        return res.render("user/cartPage", { cartItems: [], user });
      }

 
  //  console.log("CouponInfo",CouponInfo);
      res.render("user/cartPage", { cartItems: [cartItems], user });
    } catch (error) {
      console.error("Error showing cart page:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  




  
  STOREDATABAG: async (req, res) => {
    const { id } = req.params;
    console.log("machu settalle ", id);
    const userId = req.session.userId;
    console.log("userId settalle ", userId);
    
  
    try {
      if(userId){ 
      const productInfo = await Product.findById(id);
      console.log("name settaaakktto",productInfo);
      if (!productInfo) {
        return res.status(404).json({ message: "Product not found" });
      } else {
        
        let CartUser = await CARTMOD.findOne({ userId: userId });
        if (CartUser) {
          const FindIndex = CartUser.cartProducts.findIndex(p => p.productId.toString() === id);
          if (FindIndex > -1) {
            CartUser.cartProducts[FindIndex].quantity += 1;
            CartUser.cartProducts[FindIndex].total = productInfo.price;
            CartUser.cartProducts[FindIndex].subtotal = productInfo.price * CartUser.cartProducts[FindIndex].quantity;
          } else {
            CartUser.cartProducts.push({
              productName:productInfo.productName,
              productId: id,
              quantity: 1,
              total: productInfo.price,
              subtotal: productInfo.price,
              Grandtotal: 0,
              images: productInfo.images,
              stockQuantity: productInfo.stockQuantity
            });
          }
          await CartUser.save();
          console.log("Successfully stored");
          res.json({ success: true, msg: "Successfully updated cart" });
        } else {
          const userId = req.session.userId;

          CartUser = new CARTMOD({
            stockQuantity: productInfo.stockQuantity,
            userId: userId,
            cartProducts: [{
              productName:productInfo.productName,
              productId: id,
              quantity: 1,
              total: productInfo.offerPrice && productInfo.price ? productInfo.offerPrice : productInfo.price,
              subtotal: productInfo.price,
              Grandtotal: 0,
              images: productInfo.images
            }]
          });
          await CartUser.save();
          console.log("successfully added bro");
          res.json({ success: true, msg: "Successfully added product to cart" });
        }
      }
    }else{
      console.log("ithil aaaaahada praashnam");
      res.json({ success: false, err: "login and explroe more things" });
    }
    } catch (error) {
      console.error("Error storing cart data:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },






  deleteCart: async (req, res) => {
    const { id } = req.params;
    console.log("delete cart id", id);
    const userId = req.session.userId;
    console.log("hiii", userId);
    try {
      const findUserIncart = await CARTMOD.findOne({ userId: userId });
      if (findUserIncart) {
        const productIndex = await findUserIncart.cartProducts.findIndex(
          (p) => p.productId.toString() == id
        );
        console.log("index kittyo", productIndex);
        if (productIndex !== -1) {
          findUserIncart.cartProducts.splice(productIndex, 1);
          await findUserIncart.save();
        }
        res.json({
          success: true,
          msg: "Product removed from cart successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      res.json({
        success: false,
        msg: "An error occurred while deleting the product from the cart",
      });
    }
  },






  updateQuantity: async (req, res) => {
    const { id } = req.params;
console.log("loook the req.body",req.body);
    const { quantity } = req.body;
    console.log(typeof quantity, "da mwone");
    const userId = req.session.userId;
    console.log("Product ID:", id);

    try {
      const findCart = await CARTMOD.findOne({ userId: userId });

      const productIndex = findCart.cartProducts.findIndex( (p) => p.productId.toString() === id);
       
      

      console.log("Product index:", productIndex);

      if (productIndex !== -1) {
        console.log("ivade onn nokkada",quantity);

          
        // Update quantity
        findCart.cartProducts[productIndex].quantity += parseInt(quantity);
        
        console.log(
          "cartile count",
          findCart.cartProducts[productIndex].quantity
        );

        // Calculate subtotal
        let subtotal = 0;
        findCart.cartProducts.forEach((product) => {
          const total = parseFloat(product.total);
          const qty = parseInt(product.quantity);
          subtotal += total * qty;
        });

        // Update subtotal in findCart

        findCart.subtotal = subtotal;
        await findCart.save();

        console.log("Updated subtotal:", subtotal);
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Product not found in cart" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },




//quantyty decresing
  decreseBotton:async(req,res)=>{
   console.log("params",req.params);
   console.log("req.body",req.body);
   const userId = req.session.userId;
   const {id}=req.params
   const {quantity}=req.body
try {
  
  const findCart = await CARTMOD.findOne({ userId: userId });

  const productIndex = findCart.cartProducts.findIndex( (p) => p.productId.toString() === id);
   
  

  console.log("Product index:", productIndex);

  if (productIndex !== -1) {
    console.log("ivade onn nokkada",quantity);
    findCart.cartProducts[productIndex].quantity+=quantity


    console.log(
      "cartile count",
      findCart.cartProducts[productIndex].quantity
    );


     // Calculate subtotal
     let subtotal = 0;
     findCart.cartProducts.forEach((product) => {
       const total = parseFloat(product.total);
       const qty = parseInt(product.quantity);
       subtotal += total * qty;
     });

     // Update subtotal in findCart

     findCart.subtotal = subtotal;
     await findCart.save();

     console.log("Updated subtotal:", subtotal);
     res.json({ success: true });
}
}catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Internal server error" });
}

  


 }


}
