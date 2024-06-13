const router = require("express").Router();
const passport = require('passport');
const googleController = require("../controller/googleController");
require('dotenv').config();



// Route for successful login
router.get('/login/success', googleController.googleLoginSucces )






// Route for failed login
router.get('/login/failed',(req,res) => {
    res.status(401).json({
        error : true,
        message : "Log in Failure"
    })
});

router.get('/google',passport.authenticate('google',{
    scope : ['email','profile']
}));

// Callback route for Google OAuth
router.get("/google/callback",passport.authenticate('google',{
    successRedirect : process.env.CLIENT_URL,
    failureRedirect : "/login/failed"
}));

// Route to initiate Google OAuth login
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);






module.exports = router;