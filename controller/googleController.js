const Userdb=require("../models/usermodel")
const bcrypt = require("bcrypt");
module.exports = {
    googleLoginSucces:async(req,res)=>{
        try{
            console.log('req.user:', req.user);
            const { name: { givenName: name }, emails: [{ value: email }] } = req.user;
           
            const existingUser= await Userdb.findOne({email})
            if(existingUser){
                req.session.user= req.user.displayName;
                req.session.userGoogleLogged = true;
                req.session.name=name
                req.session.email = email;
                req.session.userId = existingUser._id;
            res.redirect("/")
            }else if(!existingUser.status){
                req.session.googleblock = "this email id has been blocked"
                res.redirect("/login")
            }
            
            else{
                // Generate  secure random password
      const randomPassword = Math.random().toString(36).slice(-8); 
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const createNewUser = await Userdb.create({
        name: name,
        email: email,
        password: hashedPassword, 
        status: true
      }); 
      req.session.user= req.user.displayName;
      req.session.userGoogleLogged = true;
      req.session.name = name;
      req.session.userId = createNewUser._id;
      req.session.email = email;
      return res.redirect('/');
            }

        }catch(error){
            console.error('Error during Google authentication success handling:', error);
            return res.redirect('/user-login?message=Google authentication failed');
          }
        }
    }




