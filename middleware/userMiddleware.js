const userdb=require("../models/usermodel")


//back preventing
const Authenticated = (req, res, next) => {
    if(req.session.user){
        console.log("session have user right",req.session.user);
        res.redirect("/")
    }else{
        console.log("session have user vvvvvvv right");
        next()
    }
}


const userthere= (req, res, next) => {
    if(req.session.user){
      return next()
    }else{
        
        // req.session.cartError = "If you want to go to the cart, you must be logged in.";
        return res.redirect("/");
    }
}


 // sighup back preventing
const checkOtpVerfy = (req, res, next) => {
    if(req.session.checkOtpVerfy){
       return next();
    }else{
    return res.redirect("/")
    }
}




const blockedUser= async(req,res,next)=>{
   
    console.log("user hhhhhhhhhhhh ",req.session.userId)
    const id = req.session.userId
    
    
    const User=await userdb.findById(id)
    console.log('fdfdfffdffdfdfdfdfff',User);
    if(!User){
        console.log("nooo userrr");
        next()
    }
    else if(!User.status){
        req.session.destroy(err=>{
            if(err){
                console.error(err);
            }else{
                res.render('user/blockedUser')
            }
        })
      
    }else{
        console.log("unblocked");
        next()
    }

}




        

module.exports ={
    Authenticated,
    checkOtpVerfy,
    blockedUser,
    // chekkingUser,
    // CheckingUserInCart,
    // CheckingUserInCartBotton,
    userthere
}