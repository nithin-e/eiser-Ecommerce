const Userdb=require('../models/usermodel')
const bcrypt=require("bcrypt")
const Address=require("../models/UserAddressModel")
const mongoose = require('mongoose');
const { findById } = require('../models/otpmodel');
const Wallet=require('../models/walletModel')

module.exports={
    showUserProfile: async (req, res) => {
        const  id  =req.session.userId
        console.log("qwerty",id);
        try {
            const userInfo = await Userdb.findById(id);
            if (!userInfo) {
                 req.session.noUserFound="Sorry, there was a technical error. Could you please try logging in again?"
                return res.redirect("/login")
            }
            console.log("User information:", userInfo);
            
            const user = req.session.user;
            res.render('user/UserProfile', { user, userInfo });
        } catch (error) {
            console.error("Error fetching user information:", error);
            res.status(500).send("Error fetching user information"); 
        }
    },
    

    showMyAccound:async(req,res)=>{
        res.render('user/UserProfile')
    },

    showMyAddress:async(req,res)=>{
      const user=  req.session.user
      var userId = req.session.userId;
      const alladress= await Address.find({ userId });

    console.log("all address are here kittando",alladress);
        res.render('user/UserAdress',{user,alladress})
    },

    EditName:async(req,res)=>{
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        const {name,userId}=req.body
        
        try {
            const User=await Userdb.findByIdAndUpdate(userId,{name:name})
            console.log("jjjjjjj",User);
            res.json({ success: true, msg: "Name updated successfully!" });

        } catch (error) {
            console.error('Error while :', error);
            res.status(500).send('Internal Server Error');
           
        }
    },






    //change Password
    EditPassword:async(req,res)=>{
      const {currentPassword,confirmPassword,id}=req.body
      console.log("aaale kittanndo Currernt",currentPassword);
      console.log("aaale kittanndo Conform",confirmPassword);

     try {
        const UserInfo=await Userdb.findById(id)
        
        if(!UserInfo){
            console.log("ithonnnum allah");
        }else{
            const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(currentPassword, salt);
      console.log("ith match ahno nokyokk");
      console.log("hashed pass",hashedPassword);
      console.log("database pass",UserInfo.password);
      const isMatch = await bcrypt.compare(currentPassword, UserInfo.password);
      console.log("entah avastha",isMatch);
      if(isMatch){
        
        const salt = await bcrypt.genSalt(10);
        const ChangedPassword = await bcrypt.hash(confirmPassword, salt);
         UserInfo.password=ChangedPassword
        await UserInfo.save();
        console.log("successfully! updated");
        res.json({ success: true, msg: "Password updated successfully!"});
        
      }else{
        console.log("ith entha match avathe");
        res.json({ success: false, msg: "Incorrect password entered!" });
      }
            
        }
     } catch (error) {
        console.error('Error while :', error);
        res.status(500).send('Internal Server Error');
     }
    },





    getAddressData: async (req, res) => {
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
            console.log("okaaale",userAddresses)
            if (!userAddresses) {
                console.log("No addresses found, creating a new one");
               userAddresses = new Address({
                    userId:userId,
                addresses: [AddressData]
                  });
                  await userAddresses.save();
               res.json({success:true,msg:"New Address Successfully Created"})


            } else {
                userAddresses.addresses.push(AddressData);
                await userAddresses.save();
                res.json({success:true, msg:"New Address Successfully Added"}) 
            }


        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("An error occurred.");
        }
    },
    
    
//editAddres

EditAddress: async(req, res) => {
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
},



USERWALLET: async (req, res) => {
    const userId = req.session.userId;
    const user = req.session.user;
    
    // Fetch all wallet records for the user
    const Walletbalance = await Wallet.find({ user: userId });
    console.log('.......edaa.....', Walletbalance, '.......edaa.....');
    
    res.render('user/userWallet', { Walletbalance, user });
  }


    
}


