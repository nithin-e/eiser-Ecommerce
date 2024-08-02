const Coupon=require('../../models/CouponModel');
const { exists } = require('../../models/usermodel');

module.exports={

    ShowCouponPage:async(req,res)=>{
      try {
        const StoreCoupon= await Coupon.find()
        res.render('admin/coupon',{StoreCoupon})
      } catch (error) {
        console.log('Error:', error);
            res.status(500).json({ message: "Internal Server Error" }); 
      }
       
    },

     AddCoupon :async (req, res) => {
        console.log('Request body:', req.body);
        const { couponCode, minPurchaseAmount, discountAmount, date, expiryDate } = req.body;
    
        try {
       
            const existCoupon = await Coupon.findOne({ couponCode: couponCode });
            console.log('existCoupon',existCoupon)
    
           
            if (existCoupon) {
                console.log("Coupon already exists");
                return res.status(400).json({ success: false, message: "Coupon already exists" });
            } else {
                const StoreCoupon = await Coupon.create({
                    couponCode: couponCode,
                    minPurchaseAmount: minPurchaseAmount,
                    discountAmount: discountAmount,
                    date: date,
                    expiryDate: expiryDate
                });
                console.log("Coupon created successfully");
                res.status(201).json({ success: true, message: "Coupon created successfully", StoreCoupon });
            }
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    DeleteCoupon: async (req, res) => {
        console.log('id received:', req.params);
        const { id } = req.params;
    
        try {
            const deletedCoupon = await Coupon.findByIdAndDelete(id);
            console.log('deletedCoupon:', deletedCoupon);
    
            if (deletedCoupon) {
                res.json({ success: true, message: "Coupon successfully deleted" });
            } else {
                res.json({ success: false, message: "Coupon not found" });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },


    EDITCOUPON: async(req,res)=>{
  console.log('req.body',req.body);

  const {couponId,couponCode,minPurchaseAmount,discountAmount,date,expiryDate}=req.body
       try {
        
       const FindCoupon = await Coupon.findById({_id:couponId})
       console.log('kitttadoo kuttaaaa',FindCoupon)
       if(FindCoupon){
        FindCoupon.couponCode=couponCode
        FindCoupon.minPurchaseAmount=minPurchaseAmount
        FindCoupon.discountAmount=discountAmount
        FindCoupon.date=date
        FindCoupon.expiryDate=expiryDate

        const updateCoupon=await FindCoupon.save()
        console.log("sucessfully Coupon Updated");
        res.json({success:true, message:"sucessfully Coupon Updated"})
       }

       } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal Server Error" });
       }
    }
    
    
}