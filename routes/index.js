var express = require('express');
const User = require('../models/usermodel');
const userController = require('../controller/userController');
const forgetController = require('../controller/forgetController');
const userProfileController=require('../controller/userProfileController')
const CartController=require('../controller/CartController')
const CARTMOD=require('../models/cartModel')
const CheckOutController=require('../controller/ChekOutController')
const ORDERCONTROLLER=require('../controller/orderController')
const RazorPayController=require('../controller/RazorPayController')
const WishlistController=require('../controller/wishlistController')

const {Authenticated,checkOtpVerfy,  blockedUser,userthere}= require("../middleware/userMiddleware")

var router = express.Router();

/* GET home page. */
router.get('/',userController.homepage);

router.get("/login",Authenticated,userController.login)

// login and signup page
router.get('/loginandsignup',userController.loginAndSignup);
 
// register the user
router.post('/signup',userController.registerUser);

router.get("/otp-page",checkOtpVerfy ,userController.renderOtpPage);

router.post("/verify-otp",userController.verifyOtp)

//resent otp
router.post("/resend-otp",userController.resentOtp)


router.post("/login",userController.userLogin)


//forgetemail page render
router.get("/forgetpass",forgetController.renderforgetpage)



router.post("/forgetEmail",forgetController.forgetmail)
 
// render otp
router.get("/created",forgetController.showOtpPage)

//verify otp forget
router.post("/verify-otp-page",forgetController.verifyingOtp)

//resent forget otp
router.post("/resend-otp",forgetController.resentOtpforget)


//password change
router.post("/changepassword",forgetController.passchange)



router.get("/logout", (req, res) => {
    console.log('disstoy session............................disstoy session...........................');
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Failed to log out");
        }
        res.redirect("/");
    });
});
  


//showing product details...............
router.get("/ViewProduct/:id",blockedUser, userController.ShowProductDetails);
router.get("/productPage",blockedUser, userController.showProductSeperetPage);  
router.get('/filterProduct',userController.filterProducts)
router.get('/SearchProduct',userController.SearchingProduct)



//user profile.............
router.get("/user-profile",userthere, userProfileController.showUserProfile);
router.get("/Myaccount",userthere,userProfileController.showMyAccound)
router.get("/Address",userthere,userProfileController.showMyAddress)
router.post("/update-name",userthere,userProfileController.EditName)
router.post("/Update-PassWord",userthere,userProfileController.EditPassword)
router.post("/changeAddress",userthere,userProfileController.getAddressData)
router.post('/Address-edit/:id',userthere,userProfileController.EditAddress)
router.delete("/AdressDelete/:id",userthere, userProfileController.REMOVEADDRESS);
router.get('/UserWallet',userthere,userProfileController.USERWALLET)



// cart side..............
router.get('/View-cart',userthere,CartController.ShowCartPage)
router.get('/AddToBag/:id',CartController.STOREDATABAG)
router.post('/deleteCart/:id',userthere,CartController.deleteCart)
router.post('/updateCart/:id',userthere,CartController.updateQuantity)
router.post('/decreseBotton/:id',userthere,CartController.decreseBotton)




//ckeckout.................
router.get('/CheckOutPage',userthere,CheckOutController.ShowCheckOutPage)
router.post('/AddAdress',userthere,CheckOutController.AddnewAdress)
router.post('/EDIT-ADDRESS/:id',userthere,CheckOutController.addresEditing)
router.delete('/REMOVE-ADDRESS/:id',userthere,CheckOutController.REMOVEADDRESS)




//User Oder................//this we reridecting frond end second rout
router.post('/OrderInfo',userthere,ORDERCONTROLLER.OrderInfo)
router.get('/orderSuccessPage',userthere,ORDERCONTROLLER.renderOrderSuccessPage)
router.get('/userOrder',userthere,ORDERCONTROLLER.orderPageRendering)
router.post('/CancellOrder',userthere,ORDERCONTROLLER.CancellAllOrder)
router.post('/returnOrder',userthere,ORDERCONTROLLER.ReturnProduct)
router.post('/OrderFullDetails/:id',userthere,ORDERCONTROLLER.FullOrderDetails)

// router.post('CancellEachProduct',ORDERCONTROLLER.SingleOrderRemove)

//coupon
router.post('/couponDiscount',userthere,ORDERCONTROLLER.discountCoupon)
router.post('/DeleteCoupon',userthere,ORDERCONTROLLER.DeleteCoupon)


//razor pay
router.get('/razor-key',userthere,RazorPayController.RazorKey)
router.post('/razor-order',userthere,RazorPayController.RazorOrder)


//wishlist
router.post('/AddWishlist/:id',userthere,WishlistController.ADDWISHLIST)
router.get('/GotoWishList',userthere,WishlistController.GetWishLIst)
router.post('/DeleteWishList/:id',userthere,WishlistController.DeleteWishlist)

//generate invoice
router.post('/GenerateInvoice/:id',ORDERCONTROLLER.GenerateInvoice)
router.get('/downloadinvoice/:id',ORDERCONTROLLER.DownLoadInvoice)






module.exports = router;


