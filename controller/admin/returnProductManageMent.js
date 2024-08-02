const orderModel=require('../../models/orderModel')
const Product=require('../../models/pruductModel')
const Wallet=require('../../models/walletModel')
const moment = require("moment");
const uuid = require("uuid");

 async function productQuantytyUpdate(ProductIdQuantitiesInfo) {
     
    for(let items of ProductIdQuantitiesInfo){
       const {productId,ProductQuantyty}=items
       const Products=await Product.findById(productId)
       if(Products){
        Products.stockQuantity+=ProductQuantyty
          await Products.save()
       }
        
    }
    

}



function getCurrectTime() {
    return moment().format("hh:mm A");
  }
module.exports={

    ShowReturnProduct:async(req,res)=>{
        
        const ORDER = await orderModel.find().populate('customer')
        res.render('admin/returnManageMent',{ORDER})
    },


    UpdateOrderStatus:async(req,res)=>{

      const returnSuss='Return Done'
      const returnReject='Return Rejected'
      const type ='Creadited'
      const reason='returnOrder'

      // const orderTime = getCurrectTime();
      // const CurrectDate = moment();
      // const orderDate = CurrectDate.format("DD-MM-YYYY");

        const {id}=req.params
        const {status,TotalAmound}=req.body
        console.log('......totalAmound.......',TotalAmound,'................');

        try {
    const returnedProduct= await orderModel.findOne({orderID:id})
        // console.log('....finduser....',findOrder);

 if(!returnedProduct){
  console.log("order not found");
 }

      
      // productQuantytyUpdate(ProductIdQuantitiesInfo)
      
      let wallet;

      if(status === "Approved"){
        returnedProduct.Itemstatus=status
        returnedProduct.userRequest=returnSuss
        await returnedProduct.save()


        const exists = await Wallet.findOne({ user: returnedProduct.customer });
        if (exists) {
          wallet = await Wallet.findByIdAndUpdate(exists._id, {
            $inc: {
              balance: returnedProduct.totalprice,
            },
            $push: {
              transactions: {
                transaction_id:`wallet_${uuid.v4()}`,
                amount: returnedProduct.totalprice,
                type: "credit",
                description: "Order return Refund",
                orderId: id,  
              },
            },
          });
        } else {
          wallet = await Wallet.create({
            user: returnedProduct.customer,
            balance: returnedProduct.totalprice,
            transactions: [
              {
                transaction_id: `wallet_${uuid.v4()}`,
                amount: returnedProduct.totalprice,
                type: "credit",
                description: "Order return Refund",
                orderId: id,
              },
            ],
          });
        }
      }else{
        returnedProduct.Itemstatus=status
        returnedProduct.userRequest=returnReject
        await returnedProduct.save()
      }
        } catch (error) {
            console.log(error);
        }
    }
}