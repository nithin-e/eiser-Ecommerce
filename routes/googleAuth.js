const router = require("express").Router();
const passport = require('passport');
const googleController = require("../controller/googleController");

require('dotenv').config();



// router.get('/login/success', googleController.googleLoginSucces )






// router.get('/login/failed',(req,res) => {
//     console.log('google login filled............');
    
//     res.status(401).json({
//         error : true,
//         message : "Log in Failure"
//     })
// });

// router.get('/google',passport.authenticate('google',{
//     scope : ['email','profile']
// }));

// router.get("/google/callback",passport.authenticate('google',{
    
//     successRedirect : process.env.CLIENT_URL,
//     failureRedirect : "/login/failed"
// }))

// router.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/auth/google/callback", passport.authenticate('google', {
  failureRedirect: "/login/failed"
}), googleController.googleLoginSucces);





module.exports = router;