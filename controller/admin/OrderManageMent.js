const orderModel=require('../../models/orderModel')
const Userdb=require('../../models/usermodel')
const Product=require('../../models/pruductModel')


module.exports={


    ShowOrderPage: async(req,res)=>{
      try {
        
        const ORDER = await orderModel.find().populate('customer')
        // console.log("user order",ORDER);
        res.render('admin/OrderManagement',{ORDER})
      } catch (error) {
        console.log(error);
      }
       
    },


    ChangeOrderStatus:async(req,res)=>{
        console.log("yhha status getting perfectly",req.body);
     const {orderId,status}=req.body
     console.log("Received orderId:", orderId);

     // Check the type (you mentioned it's a string)
     console.log(typeof orderId);
     
     try {
         const order = await orderModel.findOne({ orderID: orderId });
         if (!order) {
             console.log(`Order with orderId ${orderId} not found.`);
             return res.status(404).send('Order not found');
         }
         console.log('Found Order:', order.status);

           order.status=status
           await order.save()
           console.log("successfullu Updated");
           res.status(200).json({ success: true, message: "Status updated successfully", status:status});
     } catch (error) {
         console.log('Error finding order:', error);
         res.status(500).send('Error finding order');
     }
     

    }


}
