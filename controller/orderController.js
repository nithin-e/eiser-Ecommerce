const CARTMOD = require("../models/cartModel");
const USERADDRESS = require("../models/UserAddressModel");
const orderModel = require("../models/orderModel");
const Product=require('../models/pruductModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const moment = require("moment");

//queatyty UpdateFunction
 async function  updateProductQuantities (ProductIdQuantities) {
 
for (const oredrItem of ProductIdQuantities) {

 const {productId,quantity}=oredrItem

 const product =await Product.findById(productId)

 if(product){
  product.stockQuantity-=quantity
  await product.save();
 }


}

}










module.exports = {
  OrderInfo: async (req, res) => {
    const { addressId, paymentMethod, GrandTotal } = req.body;

    console.log("okey aagno", paymentMethod);
    const userId = req.session.userId;
    //generating time and date
    function getCurrectTime() {
      return moment().format("hh:mm A");
    }

    //generating orderId
    function generateOrderID() {
      const safeIndex = Math.floor(Math.random() * 100000);
      const fiveDigitId = String(safeIndex + 1).padStart(5, "0");
      return fiveDigitId;
    }
    try {
      const orderTime = getCurrectTime();
      const CurrectDate = moment();
      const orderDate = CurrectDate.format("DD-MM-YYYY");
      const orderId = generateOrderID();
      const CART = await CARTMOD.findOne({ userId: userId });
      // console.log('cart okee alle',CART.cartProducts)
      const ADDRESS = await USERADDRESS.findOne({ userId: userId });
      const selectedAddress = ADDRESS.addresses.find(
        (addr) => addr._id.toString() === addressId
      );

      //creating orde
      var newOrderData = {
        orderID: orderId,
        customer: userId,
        address: selectedAddress,
        totalprice: GrandTotal,
        orderDate: orderDate,
        orderTime: orderTime,
        paymentMethod: paymentMethod,
        products: CART.cartProducts.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          productImage:item.images,
          productName:item.productName,
          productPrice:item.total
        })),
      };

      const ProductIdQuantities = CART.cartProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
    }));
    

      console.log("all order iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiidetails", ProductIdQuantities);

      if (paymentMethod=='Cash on Delivery') {
        console.log("hi bro1");
        const newOrder = new orderModel(newOrderData);
        try {
            await CARTMOD.findOneAndDelete({ userId: userId });
          await newOrder.save();
          console.log("pakka bro");
          updateProductQuantities(ProductIdQuantities)
          res.status(200).json({ success: true, message:"succes bro succes"});
        } catch (error) {
          console.error("Error saving order:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  },


  //this we reridecting frond end
    renderOrderSuccessPage: async (req, res) => {
      try {

        res.render('user/orderSuccessPage', {
          pageTitle: 'Order Successful'
        });
      } catch (error) {
        console.error('Error rendering order success page:', error);
        res.status(500).render('error', { 
          message: 'An error occurred while loading the order success page',
          error: {}
        });
      }
    },

    orderPageRendering: async (req, res) => {
        const user = req.session.user;
        const userId = req.session.userId;
        try {
            const orderInfo = await orderModel.find({ customer: new ObjectId(userId) }).populate('products.product');
           
            // console.log("order informations", orderInfo);
            res.render('user/userOrderPage', { user, orderInfo });
        } catch (error) {
            console.log(error);
        }
    },

//cancell product........
CancellAllOrder: async (req, res) => {
  console.log('Request body:', req.body);
  const { reason, OrderId } = req.body;
  
  try {
    const CancellOrder = await orderModel.findOne({ orderID: OrderId });
    console.log("Finding order info:", CancellOrder);
    
    if (CancellOrder) {
      CancellOrder.status = 'Cancelled'; 
      await CancellOrder.save();          
      res.status(404).json({ success: true, message: " order Cancelled" });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},


//deleting each order
SingleOrderRemove:(req,res)=>{
  console.log("req.body88******",req.body);
}






};

