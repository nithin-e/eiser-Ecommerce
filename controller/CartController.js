const Product = require("../models/pruductModel");
const userdb = require("../models/usermodel");
const CARTMOD = require("../models/cartModel");
const Coupon= require('../models/CouponModel')


module.exports = {
  
 ShowCartPage: async (req, res) => {
    const userId = req.session.userId;
    try {
      const user = req.session.user;
  
      let cartItems = await CARTMOD.findOne({ userId })
        .populate({
          path: "cartProducts.productId",
          model: 'Product',
        })
        .lean();
  
      if (!cartItems || !cartItems.cartProducts || cartItems.cartProducts.length === 0) {
        return res.render("user/cartPage", { cartItems: [], user, grandTotal: 0, subtotal: 0, shippingCost: 0 });
      }
  
      // Calculate subtotal only for products with status true
      let subtotal = 0;
      cartItems.cartProducts.forEach(product => {
        if (product.productId && product.productId.status) {
          let productTotal;
          if (product.categoryOffer == '10' || product.categoryOffer == '20' || product.categoryOffer == '30') {
            let discount = product.total * parseInt(product.categoryOffer) / 100;
            let discounts=Math.floor(discount)
            productTotal = discounts * product.quantity;
            console.log('.........kittando..........');
            
          } else {
            productTotal = product.total * product.quantity;
          }
          subtotal += productTotal;
        }
      });
  
      // Determine shipping cost and grand total
      let shippingCost = subtotal > 0 ? 100 : 0;
      let grandTotal = subtotal + shippingCost;
  
      res.render("user/cartPage", { 
        cartItems: [cartItems], 
        user, 
        grandTotal,
        subtotal,
        shippingCost
      });
  
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
      const numericValue = parseFloat(productInfo.categoryOffer.replace('%', ''));
      console.log('...........marindo.........................',numericValue);
      
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
              categoryOffer:numericValue,
              total: productInfo.offerPrice && productInfo.price ? productInfo.offerPrice : productInfo.price,
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
              categoryOffer:numericValue,
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
    const { quantity } = req.body;
    const userId = req.session.userId;
  
    try {
      const findCart = await CARTMOD.findOne({ userId: userId });
      if (!findCart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const productIndex = findCart.cartProducts.findIndex(
        (p) => p.productId.toString() === id
      );
  
      if (productIndex !== -1) {
        // Update quantity
        findCart.cartProducts[productIndex].quantity += parseInt(quantity);
  
        // Calculate subtotal
        let subtotal = 0;
        findCart.cartProducts.forEach((product) => {
          let total;
          const qty = parseInt(product.quantity);
  
          if (product.categoryOffer === '10' || product.categoryOffer === '20' || product.categoryOffer === '30') {
            const discount = product.total * product.categoryOffer / 100;
            const discounts = Math.floor(discount);
            console.log('discounts ethre varane',discounts);
            total =  discounts;
            console.log('total ethre varane',total);
            subtotal += total * qty;
           return product.subtotal=subtotal
          } else {
            total = parseFloat(product.total);
            console.log('total ethre varane elsente ullil',total);
          return  subtotal += total * qty;
          }
  
          
        });
  
        console.log('if nte porathe subtotol',subtotal);

        // console.log('data basithe subtotal',findCart.subtotal);
        findCart.cartProducts[productIndex].subtotal=subtotal

        
        // Update and save cart
        // findCart.subtotal = subtotal;
        await findCart.save();
        res.json({ success: true, subtotal: subtotal });
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
