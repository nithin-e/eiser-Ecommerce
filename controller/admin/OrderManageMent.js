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


    ChangeOrderStatus: async (req, res) => {
      console.log("Received request body:", req.body);
      const { orderId, status } = req.body;
      console.log("Received orderId:", orderId);
  
      try {
          // Find the order by orderId
          const order = await orderModel.findOne({ orderID: orderId });
          if (!order) {
              console.log(`Order with orderId ${orderId} not found.`);
              return res.status(404).send('Order not found');
          }
  
          // Log the current status
          console.log('Found Order status:', order.status);
  
          // Update the order status
          order.status = status;
          await order.save();
          console.log("Successfully updated status");
  
          // Send success response
          res.status(200).json({ success: true, message: "Status updated successfully", status });
      } catch (error) {
          console.error('Error updating order status:', error);
          res.status(500).send('Error updating order status');
      }
  }
  


}
