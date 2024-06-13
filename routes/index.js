var express = require('express');
const User = require('../models/usermodel');
const userController = require('../controller/userController');
const forgetController = require('../controller/forgetController');

var router = express.Router();

/* GET home page. */
router.get('/',userController.homepage);

router.get("/login",userController.login)

// login and signup page
router.get('/loginandsignup',userController.loginAndSignup);
 
// register the user
router.post('/signup',userController.registerUser);

router.get("/otp-page",userController.renderOtpPage)

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
router.post("/resend",forgetController.resentOtpforget)


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
  



module.exports = router;
