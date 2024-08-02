const { findById } = require('../models/usermodel');
const Wishlist=require('../models/WishlistModel')
const Product=require('../models/pruductModel')
const mongoose = require('mongoose');


module.exports={

    
ADDWISHLIST: async (req, res) => {
  console.log("Request Params:", req.params);
  const { id } = req.params;
  const userId = req.session.userId;
  console.log("User ID:", userId);
  console.log("Product ID:", id);

  try {

    if(!userId){
      res.json({success:false, msng:'login and explore more things'})
    }
  
    findProduct=await Product.findById(id)
    if(!findProduct){

    }else{
      console.log("kerindooo");
      const wishlistItem = new Wishlist({
        userId: userId, 
        productId : findProduct._id
    });
    console.log("____________________",wishlistItem);
    await wishlistItem.save();
    res.json({success:true, msng:'Wishlist item added successfully'})
    } 
  } catch (error) {
    console.log("Error:", error);
  }
},


GetWishLIst: async (req, res) => {
  const userId = req.session.userId;
  const user = req.session.user;
  const page = parseInt(req.query.page) || 1; // Page number
  const limit = parseInt(req.query.limit) || 5; // Number of items per page

  try {
    console.log('userId', userId);

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

   
    const totalWishlistItems = await Wishlist.countDocuments({ userId: userObjectId });

    
    const skip = (page - 1) * limit;

    
    const wishlistItems = await Wishlist.find({ userId: userObjectId })
                                        .skip(skip)
                                        .limit(limit);
    console.log('wishlistItems', wishlistItems);

    const wishlistProductIds = wishlistItems.map(item => item.productId);

    const wishlistProducts = await Product.find({ _id: { $in: wishlistProductIds } });

    
    const totalPages = Math.ceil(totalWishlistItems / limit);

    res.render('user/wishlistPage', {
      products: wishlistProducts,
      user,
      currentPage: page,
      totalPages,
      limit,
      user
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).send('Server error');
  }
},

DeleteWishlist:async(req,res)=>{
  console.log('req.params',req.params);
  const {id}=req.params
try {
  
  await Wishlist.findOneAndDelete({ productId:id });
  res.status(200).json({success:true, msng: 'Product removed from wishlist successfully' });
    
} catch (error) {
  console.log(error);
}
}


}


