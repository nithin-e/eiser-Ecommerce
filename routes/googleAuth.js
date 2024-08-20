const router = require("express").Router();
const passport = require('passport');
const googleController = require("../controller/googleController");

require('dotenv').config();



 router.get('/login/success', googleController.googleLoginSucces )








router.get('/google', (req, res, next) => {
    console.log('Attempting Google authentication');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
  
router.get("/google/callback", passport.authenticate('google', {
  failureRedirect: "/login/failed"
}), googleController.googleLoginSucces);





module.exports = router;