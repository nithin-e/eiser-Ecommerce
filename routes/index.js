var express = require('express');
const User = require('../models/usermodel');
const userController = require('../controller/userController');
const forgetController = require('../controller/forgetController');
const userProfileController=require('../controller/userProfileController')
const {Authenticated,checkOtpVerfy,  blockedUser,chekkingUser }= require("../middleware/userMiddleware")

var router = express.Router();

/* GET home page. */
router.get('/',userController.homepage);

router.get("/login",Authenticated,userController.login)

// login and signup page
router.get('/loginandsignup',Authenticated,userController.loginAndSignup);
 
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
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            // Optionally, handle the error in the response
            return res.status(500).send("Failed to log out");
        }
        
        // Redirect to the homepage
        res.redirect("/");
    });
});
  
//showing product details
router.get("/ViewProduct/:id",blockedUser, userController.ShowProductDetails);


router.get("/productPage",blockedUser, userController.showProductSeperetPage);



//user profile
router.get("/user-profile",chekkingUser, userProfileController.showUserProfile);
router.get("/Myaccount",chekkingUser,userProfileController.showMyAccound)
router.get("/Address",chekkingUser,userProfileController.showMyAddress)
router.post("/update-name",chekkingUser,userProfileController.EditName)
router.post("/Update-PassWord",chekkingUser,userProfileController.EditPassword)
router.post("/changeAddress",chekkingUser,userProfileController.getAddressData)
router.post('/Address-edit/:id',chekkingUser,userProfileController.EditAddress)
router.delete("/AdressDelete/:id",chekkingUser, userProfileController.REMOVEADDRESS);



module.exports = router;
