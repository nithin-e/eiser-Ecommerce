const Address=require("../models/UserAddressModel")
const CARTMOD=require('../models/cartModel')
const ORDERMOD=require('../models/orderModel')



module.exports={
    ShowCheckOutPage: async (req, res) => {
        const user = req.session.user;
        const userId = req.session.userId;
       
        try {
            let cartItems = await CARTMOD.findOne({ userId: userId });
            // cartItems = cartItems ? cartItems : { cartProducts: [] }; 
            
               
                console.log("cart information in checkout", cartItems);
                if(cartItems==null){
                    console.log("kittyada mone");
                    res.redirect('/View-cart')
                }
    
                const userAddresses = await Address.findOne({ userId: userId }).populate('addresses');
                const AllAdress = userAddresses ? userAddresses.addresses : [];
        
                res.render('user/CheckoutPage', { user, AllAdress, cartItems: [cartItems] });
        
    
           
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    },
    

    
    //add addres
    AddnewAdress:async(req,res)=>{
        var userId = req.session.userId;
        console.log("user id:", userId);
        const { name, mobile, pincode, state, address, locality, city } = req.body;
        try {
            
            const AddressData={
                name,
                mobile,
                pincode,
                state,
                address,
                locality,
                city
            } 
            var userAddresses =await Address.findOne({ userId });
            if (!userAddresses) {
                console.log("No addresses found, creating a new one");
               userAddresses = new Address({
                    userId:userId,
                addresses: [AddressData]
                  });
                  await userAddresses.save();
                  console.log("New Address Successfully Created");
               res.json({success:true,msg:"New Address Successfully Created"})


            } else {
                userAddresses.addresses.push(AddressData);
                await userAddresses.save();
                res.json({success:true, msg:"New Address Successfully Added"}) 
            }

        } catch (error) {
            console.error("Error fetching addresses:", error);
            
        }
    },

// editt adress
addresEditing: async(req, res) => {
        const userId = req.session.userId;
        const {id}  = req.params; 
    
        console.log("ith kittando", id);
        const { name, mobile, pincode, state, address, locality, city } = req.body;
        try {
            const AddressData = { name, mobile, pincode, state, address, locality, city };
    
            const UserAddress = await Address.findOne({ userId: userId });
            console.log("kittanilley", UserAddress);
    
            if (!UserAddress) {
                return res
                    .status(404)
                    .json({ message: "User address document not found" });
            } else {
                console.log("mooneeee");
                const findAddressIndex = UserAddress.addresses.findIndex(address => address._id.toString() === id); 
    
                console.log("pettullee", findAddressIndex);
    
                if (findAddressIndex === -1) {
                    return res.status(404).json({ message: "Address not found" });
                }
    
                // Update the address at the found index
                UserAddress.addresses[findAddressIndex] = { ...UserAddress.addresses[findAddressIndex], ...AddressData };
    
                await UserAddress.save();
                 console.log("Address updated successfully" );
                
                res.json({success:true, msg:"Address updated successfully" }) 
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "An error occurred while updating the address" });
        }
    },


    
REMOVEADDRESS: async(req,res)=>{
    const userId = req.session.userId;
    const {id}  = req.params; 
try {
    const IdAddress = await Address.findOne({ userId: userId });
    
    if (!IdAddress) {
        return res
            .status(404)
            .json({ message: "User address document not found" });
    }else{
        const findAddressIndex = IdAddress.addresses.findIndex(address => address._id.toString() === id); 
  
        IdAddress.addresses.splice(findAddressIndex,1)
        await IdAddress.save();
        res.json({success:true,msg:"successfully Deleted!"})
    }
} catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred while updating the address" });
}
}

}