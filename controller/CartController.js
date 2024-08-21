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
          populate: [
            {
              path: 'category',
              model: 'categorys'
            },
            {
              path: 'brand',
              model: 'brands'
            }
          ]
          
        })
        .lean();

        

  
      if (!cartItems || !cartItems.cartProducts || cartItems.cartProducts.length === 0) {
        return res.render("user/cartPage", { cartItems: [], user, grandTotal: 0, subtotal: 0, shippingCost: 0 });
      }
  
      let discounts
      let subtotal = 0;
      cartItems.cartProducts.forEach(product => {
        if (product.productId.status && product.productId.status&&product.productId.category.status) {
          let productTotal;

          
          if (product.productId.category.offerPrice== '10%' ||product.productId.category.offerPrice == '20%' || product.productId.category.offerPrice == '30%'&&product.productId.offerPrice == 0 || null) {
            let discount = product.total * parseInt(product.productId.category.offerPrice.split('').slice(0,2).join('')) / 100;
             discounts=Math.floor(discount)
            productTotal = product.total-discounts
    
          } else if(product.productId.offerPrice != null||0){
           
           productTotal =  product.productId.offerPrice 
          }else{
            productTotal = product.total 
          }
          subtotal +=  productTotal * product.quantity
     
          
        }
      });
  

      
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
    const userId = req.session.userId;
    
  
    try {
      if(userId){ 
      const productInfo = await Product.findById(id);
      const numericValue = parseFloat(productInfo.categoryOffer.replace('%', ''));
      
      if (!productInfo) {
        return res.status(404).json({ message: "Product not found" });
      } else {
        
        let CartUser = await CARTMOD.findOne({ userId: userId });
        if (CartUser) {
          const FindIndex = CartUser.cartProducts.findIndex(p => p.productId.toString() === id);
          if (FindIndex > -1) {
            console.log('first.................... click');
            
            CartUser.cartProducts[FindIndex].quantity += 1;
            CartUser.cartProducts[FindIndex].total = productInfo.price;
            CartUser.cartProducts[FindIndex].subtotal = productInfo.price * CartUser.cartProducts[FindIndex].quantity;
          } else {
            console.log('second...........click');
            
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
          res.json({ success: true, msg: "Successfully pushed updated cart" });
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
          res.json({ success: true, msg: "Successfully created product to cart" });
        }
      }
    }else{
      console.log("ithil aaaaahada praashnam");
      res.json({ success: false});
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
    const { id } = req.params
    const { quantity } = req.body;
    const userId = req.session.userId;

    console.log('req.body................ quantity',quantity);
    
  
    try {

      const findCart = await CARTMOD.findOne({ userId: userId })
    .populate({
        path: 'cartProducts.productId', 
        populate: {
         path: 'category',
         model: 'categorys'
        }
    })
    .exec();
    
    
      

      if (!findCart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      
  
      const productIndex = findCart.cartProducts.findIndex(
        (p) => p.productId._id.toString() === id
      );
      if (productIndex !== -1) {
    

      if(findCart.cartProducts[productIndex].quantity ===  findCart.cartProducts[productIndex].productId.stockQuantity){
       return res.json({success:false,messege:"Product Quatity is Over"})
     }

    

     let limit=10
     if(findCart.cartProducts[productIndex].quantity>=limit  ){
      console.log('...quantyty nokyokk.....',findCart.cartProducts[productIndex].quantity);
      
      return res.json({success:false,messege:"ur purchase limit is Over"})
    }

     //main thing updating quantyty
    findCart.cartProducts[productIndex].quantity += parseInt(quantity);
  
        let subtotal = 0;
        findCart.cartProducts.forEach(product => {
          let total;
          const qty = parseInt(product.quantity);

          



          if (product.productId.category.offerPrice== '10%' ||product.productId.category.offerPrice == '20%' || product.productId.category.offerPrice == '30%'&&product.productId.offerPrice == 0 || null) {
            
            let discount = product.total * parseInt(product.productId.category.offerPrice.split('').slice(0,2).join('')) / 100;
            const discounts = Math.floor(discount);
            
            total=discounts
            
           return subtotal += (product.total-total)*qty

          }else if(product.productId.offerPrice != null||0){
            total = parseFloat(product.total);
          return  subtotal += total *product.quantity
           } else {
            console.log('...................else....');
            
            total = parseFloat(product.total);
          return  subtotal += total *product.quantity
          }
        })
  
       
        let shippingCost=100
        let grandTotal = subtotal + shippingCost;
      
        
        findCart.cartProducts[productIndex].subtotal=subtotal
        findCart.subtotal = subtotal;
        await findCart.save();


        var quantityCart=findCart.cartProducts[productIndex].quantity
        res.json({ success: true, subtotal: subtotal,quantityCart,id,findCart,grandTotal});
      } else {
        res.status(404).json({ message: "Product not found in cart" });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  



//quantyty decresing
decreaseButton: async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body;
  const userId = req.session.userId;

  console.log('req.body................ quantity',quantity);
  

  try {

    const findCart = await CARTMOD.findOne({ userId: userId })
  .populate({
      path: 'cartProducts.productId', 
      populate: {
       path: 'category',
       model: 'categorys'
      }
  })
  .exec();
  
  
    

    if (!findCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    

    const productIndex = findCart.cartProducts.findIndex(
      (p) => p.productId._id.toString() === id
    );
    if (productIndex !== -1) {
  
   //main thing
   findCart.cartProducts[productIndex].quantity += parseInt(quantity);


   if(findCart.cartProducts[productIndex].quantity<=0  ){
    console.log('...quantyty nokyokk.....',findCart.cartProducts[productIndex].quantity);
    
    return res.json({success:false,messege:"Zero is not possible"})
  }
  


      let subtotal = 0;
      findCart.cartProducts.forEach(product => {
        let total;
        const qty = parseInt(product.quantity);
        if (product.productId.category.offerPrice== '10%' ||product.productId.category.offerPrice == '20%' || product.productId.category.offerPrice == '30%'&&product.productId.offerPrice == 0 || null) {
          
          let discount = product.total * parseInt(product.productId.category.offerPrice.split('').slice(0,2).join('')) / 100;
          const discounts = Math.floor(discount);
          
          total=discounts
          subtotal +=product.total * qty-total
         return product.subtotal=subtotal*product.quantity

        }else if(product.productId.offerPrice != null||0){
          total = parseFloat(product.total);
        return  subtotal += total *product.quantity
         } else {
          console.log('...................else....');
          
          total = parseFloat(product.total);
        return  subtotal += total *product.quantity
        }
      })

      let shippingCost=100
      let grandTotal = subtotal + shippingCost;
    
    
      
      findCart.cartProducts[productIndex].subtotal=subtotal
      findCart.subtotal = subtotal;
      await findCart.save();
      var quantityCart=findCart.cartProducts[productIndex].quantity

      console.log('.........check quantyty cart',quantityCart);
      console.log('.........check cart subtotal',subtotal);
      console.log('.........check quantyty cart',grandTotal);
      
      res.json({ success: true, subtotal: subtotal,quantityCart,id,findCart,grandTotal});
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
},


}
