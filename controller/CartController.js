const Product =require("../models/pruductModel")
const userdb= require("../models/usermodel")
const CARTMOD=require("../models/cartModel")



module.exports={
  ShowCartPage: async (req, res) => {
    try {
      const cartItems = await CARTMOD.find().populate('cartProducts');
  
      
      if (!cartItems.length) {
        const user = req.session.user;
        console.log("sessionil indo",user)
        return res.render("user/cartPage", { productDetails: [] ,user}); 
      }
  
      const formattedCartItems = cartItems.map(item => ({
        productId: item.cartProducts[0].productId, 
        quantity: item.cartProducts[0].quantity,
        total: item.cartProducts[0].total,
        subtotal: item.cartProducts[0].subtotal,
        productName: item.cartProducts[0].productName,
        images: item.cartProducts[0].images,
      }));
  
     console.log("nalle review aanu",formattedCartItems);

     const user = req.session.user;
     
     console.log("sessionil indo",user)
      res.render("user/cartPage", { productDetails: formattedCartItems,user});
  
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
                  images: productInfo.images
                });
              }
              await CartUser.save();
              console.log("Successfully stored");
              res.json({ success: true, msg: "Successfully updated cart" });
            } else {
              const userId = req.session.userId;

              CartUser = new CARTMOD({
                userId: userId,
                cartProducts: [{
                  productName:productInfo.productName,
                  productId: id,
                  quantity: 1,
                  total: productInfo.price-productInfo.offerPrice,
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




      // STOREDATACART: async (req, res) => {
      //   const { id } = req.params;
      //   console.log("kittando ee id anak",id);
      //   try {
      //     req.session.paramsId = id;
      //     res.redirect('/view-cart');
      //   } catch (error) {
      //     console.error('Error while adding product:', error);
      //     res.status(500).send('Internal Server Error');
      //   }
      // },

}





