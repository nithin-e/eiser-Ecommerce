const userdb=require("../models/usermodel")


//back preventing
const Authenticated = (req, res, next) => {
    if(req.session.user){

        res.redirect("/")
    }else{
        next()
    }
}


const userthere= (req, res, next) => {
    if(req.session.user){
      return next()
    }else{
        console.log('hi one');
        
        return res.redirect("/login");
    }
}


 // sighup back preventing
const checkOtpVerfy = (req, res, next) => {
    if(req.session.checkOtpVerfy){
       return next();
    }else{
        console.log('hi one2');
    return res.redirect("/")
    }
}




const blockedUser= async(req,res,next)=>{
   
    const id = req.session.userId
    
    
    const User=await userdb.findById(id)
    console.log('fdfdfffdffdfdfdfdfff',User);
    if(!User){
       
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
    userthere
}