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
    checkOtpVerfy
}