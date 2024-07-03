const userdb=require("../models/usermodel")



const Authenticated = (req, res, next) => {
    if(req.session.user){
        console.log("session have user right",req.session.user);
        res.redirect("/")
    }else{
        console.log("session have user vvvvvvv right");
        next()
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


function chekkingUser(req,res,next) {
    if(req.session.user){
        next()
    }else{   
        req.session.noUserFound="Sorry, there was a technical error. Could you please try logging in again?"
                return res.redirect("/login")
    }
}
//before login


//checking user exist or not

// const userExisist= async (req,res,next)=>{
    
//     try {
//         const id = req.session?.userId;
//         console.log("id",id);
//         if(!id){
//             return next();
//          }
//           const existId=  await userdb.findById(id)
//           console.log(existId);
//              if(existId.status==true){
//                  next()
//              }else{
//                  res.redirect("/login");
//              }
         
//     } catch (error) {
//         console.log(error);
//     }
// }
 

module.exports ={
    Authenticated,
    checkOtpVerfy,
    blockedUser,
    chekkingUser,
}