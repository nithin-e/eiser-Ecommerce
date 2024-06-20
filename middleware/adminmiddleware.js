const userdb=require("../models/usermodel")

//admin exist means we redirect adminHome
const adminAuth=(req,res,next)=>{
    if(req.session.Admin){
         res.redirect('/admin_home')
       
        }else{
            console.log("not admin")
            res.render("admin/admin_login");
    }
}


///just checking admin exist or not  
const veryfyAdmint=(req,res,next)=>{
    if(req.session.Admin){
        console.log("now admim available");
        next()
        }else{
            console.log("admin  not available");
    res.redirect("/admin_login")
    }
}





module.exports ={
    adminAuth,
    veryfyAdmint
}