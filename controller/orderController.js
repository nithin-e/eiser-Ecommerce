const CARTMOD = require("../models/cartModel");
const USERADDRESS = require("../models/UserAddressModel");
const orderModel = require("../models/orderModel");
const Product=require('../models/pruductModel')
const Wallet=require('../models/walletModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const moment = require("moment");
const uuid = require("uuid");
const { generateInvoice } = require('../util/InvoiceCreator')
const path=require('path')
const fs=require('fs')


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



async function quantityIncresing(PruductQuantityInfo) {


for (const orderItem of PruductQuantityInfo) {
  const {ProductId,Productquantity}=orderItem
  const productIdString = ProductId.toString();
  const productt= await Product.findById(ProductId)
  if(productt){
    productt.stockQuantity+=Productquantity
    await productt.save()
  }
}


}





module.exports = {
  OrderInfo: async (req, res) => {
         
    console.log("okey aano",req.body);
    const { addressId, paymentMethod, GrandTotal} = req.body;

    
    const userId = req.session.userId;
    console.log('...........userId...............',userId);
    //generating time and date
    function getCurrectTime() {
      return moment().format("hh:mm A");
    }

    //getting that value in session
    const CouponAmound=req.session.Amount

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
      console.log('cart okee alle', CART);
      console.log('cart okee alle',CART)
      const ADDRESS = await USERADDRESS.findOne({ userId: userId });
      const selectedAddress = ADDRESS.addresses.find(
        (addr) => addr._id.toString() === addressId
      );


      console.log('_________________________________________()',orderDate);

      //creating order
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
        CouponAmound: CouponAmound || 0
      };

      console.log("entha ibde seeen",newOrderData);

      const ProductIdQuantities = CART.cartProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
    }));
    


      if (paymentMethod=='Cash on Delivery') {
        console.log("hi bro1");
        const newOrder = new orderModel(newOrderData);
        try {
          delete req.session.Amount
            await CARTMOD.findOneAndDelete({ userId: userId });
          await newOrder.save();
          console.log("pakka bro");
          updateProductQuantities(ProductIdQuantities)
          res.status(200).json({ success: true, message:"succes bro succes"});
        } catch (error) {
          console.error("Error saving order:", error);
        }
      }


      if(paymentMethod=='Razor Pay'){
        console.log("now happy");
        const newOrder = new orderModel(newOrderData);
        try {
          delete req.session.Amount
            await CARTMOD.findOneAndDelete({ userId: userId });
          await newOrder.save();
          console.log("pakka broooooooooooo");
          updateProductQuantities(ProductIdQuantities)
          res.status(200).json({ success: true, message:"succes bro succes"});
        } catch (error) {
          console.error("Error saving order:", error);
        }
      }



      if (paymentMethod === 'Wallet') {
        console.log("Processing wallet payment:", GrandTotal);
    

        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: "Wallet not found." });
        }
    
        
        if (GrandTotal > wallet.balance) {
            console.log('Insufficient balance.');
            return res.json({ success: false, message: "Insufficient balance." });
        }
    
       
        const newOrder = new orderModel(newOrderData);
        try {
            // Clear the session amount
            delete req.session.Amount;
    
            // Remove items from cart
            await CARTMOD.findOneAndDelete({ userId: userId });
    
          
            await newOrder.save();
            console.log("Order saved successfully.");
    
            updateProductQuantities(ProductIdQuantities);
    
           
            wallet.balance -= GrandTotal;
    
            
            await Wallet.findByIdAndUpdate(wallet._id, {
                $push: {
                    transactions: {
                        transaction_id: `wallet_${uuid.v4()}`,
                        amount: GrandTotal,
                        type: "debit",
                        description: "Order payment",
                        orderId: newOrder._id,
                    },
                },
                $set: { balance: wallet.balance },
            });
    
            console.log("Wallet updated successfully.");
    
      
            res.status(200).json({ success: true, message: "Payment successful." });
    
        } catch (error) {
            console.error("Error processing order:", error);
            res.status(500).json({ success: false, message: "Internal server error." });
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

    const PruductQuantityInfo=CancellOrder.products.map(value=> {
      const ProductId= value.product
      const Productquantity=value.quantity
      return {ProductId,Productquantity} 
    })

  
    let wallet;
    
    if (CancellOrder) {
      console.log('PruductQuantityInfo kittando',PruductQuantityInfo);
      CancellOrder.status = 'Cancelled'; 
      await CancellOrder.save();  
      quantityIncresing(PruductQuantityInfo)  
      const exists = await Wallet.findOne({ user: CancellOrder.customer });
         if(exists){
          wallet = await Wallet.findByIdAndUpdate(exists._id, {
            $inc: {
              balance: CancellOrder.totalprice,
            },
            $push: {
              transactions: {
                transaction_id:`wallet_${uuid.v4()}`,
                amount: CancellOrder.totalprice,
                type: "credit",
                description: "Order cancell Refund",
                orderId: OrderId,  
              },
            },
          });
          res.status(404).json({ success: true, message: " order Cancelled" });
         }else{
          
            wallet = await Wallet.create({
              user: CancellOrder.customer,
              balance: CancellOrder.totalprice,
              transactions: [
                {
                  transaction_id: `wallet_${uuid.v4()}`,
                  amount: CancellOrder.totalprice,
                  type: "credit",
                  description: "Order Cancell Refund",
                  orderId: OrderId,
                },
              ],
            });
            res.status(404).json({ success: true, message: " order Cancelled" });
          }
         
     

      
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
},


discountCoupon:(req,res)=>{

const {Amount}=req.body
console.log('gggggggggg',Amount);
req.session.Amount=Amount
res.json({success:true})
},


DeleteCoupon: async (req, res) => {
  console.log("deleting amount kittando", req.body);
  const { amount } = req.body;
  try {
      
      if (req.session.Amount) {
          delete req.session.Amount; 
      }
      res.json({ success: true });
  } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
},

ReturnProduct:async(req,res)=>{
console.log('req.params okeaahhno',req.body);
const id = req.session.userId;
const{ orderID,reason}=req.body
try {
  const ReturnOeder = await orderModel.findOne({ orderID: orderID });
  console.log('ReturnOeder',ReturnOeder);
  ReturnOeder.userRequest='Requested For Return'
  ReturnOeder.returnReason=reason
  ReturnOeder.save()
 console.log("ReturnOeder",ReturnOeder);
 res.json({success:true})
} catch (error) {
  console.error("Error deleting coupon:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}


},

FullOrderDetails: async(req,res)=>{
  const {id}=req.params
  try {
    const findOrder= await orderModel.findOne({orderID:id})
    if(!findOrder){
      console.log('order  not found');
    }
    res.json({success:true,message:findOrder})
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},





GenerateInvoice: async(req,res)=>{
  console.log('is it oke',req.params);
  const {id}=req.params
  try {
    
 const orderDetails= await orderModel.findOne({orderID:id})
 console.log('orderDetails',orderDetails);
 
if(orderDetails.status=="Delivered"){
  console.log('if aaahnu ullathu');
  const invoicePath = await generateInvoice(orderDetails)
  console.log('invoicePath',invoicePath);
  res.json({ success: true, message: "Invoice generated successfully", invoicePath });
}else{
  console.log('else is working');
}


  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
},

DownLoadInvoice: async(req,res)=>{
  console.log('Downloading invoice for order:', req.params.id);
  console.log('Downloading invoice for order:', req.params.id);
  try {
      const { id } = req.params;
      const filePath = path.join(__dirname, '..', 'public', 'invoPdf', `${id}.pdf`);
      console.log('File path:', filePath); 

      if (fs.existsSync(filePath)) {
        console.log('kerindo ithil');
          res.download(filePath, `invoice_${id}.pdf`);
      } else {
          console.error('File not found:', filePath);
          res.status(404).json({ success: false, message: "Invoice not found" });
      }
  } catch (error) {
      console.error("Error in downloading the invoice:", error);
      res.status(500).json({ success: false, message: "Error in downloading the invoice" });
  }
}




};



