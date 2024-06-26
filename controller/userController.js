const { session } = require("passport");
const userdb = require("../models/usermodel");
const otpmodel = require("../models/otpmodel");
const { render } = require("../app");
const genOtp = require("../util/otpgenarate");
const { sendEmail } = require("../util/nodemailer");
const bcrypt = require("bcrypt");
const Product =require("../models/pruductModel")

let i = 150;
module.exports = {
  homepage: async (req, res) => {
    const user = req.session.user;
    req.session.nouser = null;

    const allProduct= await   Product.find()
    res.render("user/user_home", { user: user,allProduct});
  },

  login: (req, res) => {
    const lock=req.session.lock
    req.session.lock=null

    const success=req.session.success
    req.session.success=null

    const blockuser=req.session.blockuser
    req.session.blockuser=null

    const googleblock=req.session.googleblock 
    req.session.googleblock =null
    res.render("user/user_login" ,{lock,blockuser,googleblock});
  },

  loginAndSignup: (req, res) => {
    const nouser = req.session.nouser;
    req.session.nouser = null;
    res.render("user/user_signup", { nouser });
  },

  //render otp page
  renderOtpPage: (req, res) => {
   let errMess = null;
    if (req.session.errMess) {
     errMess = req.session.errMess;
     req.session.errMess = null;
    }
    res.render("user/otp", {errMess});
  },



  //store user database
  registerUser: async (req, res) => {
    const { name, password, email } = req.body;
    try {
      // Checking whether user already exists
      const existingUser = await userdb.findOne({ email: email });

      if (existingUser) {
       
        req.session.nouser = "This email is already registered. You can login with another one.";
      } else {
        req.session.email = email;
        req.session.user = name;
        
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const userdata = await userdb.insertMany({ name, password:hashPassword, email });
      }

      const { otpcode, otpExpires } = await genOtp();
      
      console.log("otp",otpcode);

      // Update or insert OTP document in the database                  
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otpcode, salt);

      await otpmodel.findOneAndUpdate(
        { email },
        { otpcode: hashedOtp, otpExpires },
        { upsert: true, new: true }
      );
      console.log("OTP stored in DB");




      // Send OTP email
      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Here is your OTP code: ${otpcode}`,
      };
       
      sendEmail(mailOptions);
      // Send the email
      console.log("OTP email sent successfully");

      // Render OTP page
       req.session.checkOtpVerfy =true;
      res.redirect("/otp-page");

      const x = setInterval(() => {
        if (i == 0) {
          if (otpmodel.find({ email })) {
            userdb.deleteOne(email);
            otpmodel.deleteOne(email);
          }

          clearInterval(x);
        } else {
          i--;
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in registerUser:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    }
  
  },



  //verify otp
  verifyOtp: async (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;

    const email = req.session.email;

    const otpcode = [otp1, otp2, otp3, otp4].join("");
    console.log("Received OTP:", otpcode, "for email:", email);

    try {
      const user = await otpmodel.findOne({ email });
      if (!user) {
        req.session.errMess = "Not user there";
        return res.redirect("/otp-page");
            }
      console.log("ourotp", otpcode, "hassed", user.email);
      const isMatch = await bcrypt.compare(otpcode, user.otpcode);

      console.log("ismatch1", isMatch);
      if (!isMatch) {
        req.session.errMess = "Invalid OTP";
        return res.redirect("/otp-page");
      }
      await otpmodel.deleteOne({ email: email });
      req.session.user = email;
      delete req.session.checkOtpVerfy
      res.redirect("/");
    } catch (error) {
      console.log(error);
      if (!res.headersSent) {

        req.session.errMess = "An error occurred during OTP verification";
        
        return res.redirect("/otp-page");
      }
    }
  },





  //resent-otp
  resentOtp: async (req, res) => {
    const { email } = req.session;
    console.log("this is from email", email);
    try {
      const { otpcode, otpExpires } = await genOtp();

      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otpcode, salt);

      await otpmodel.findOneAndUpdate(
        { email },
        { otpcode: hashedOtp, otpExpires },
        { upsert: true, new: true }
      );

      const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Here is your OTP code: ${otpcode}`,
      };
      //calling send function
      await sendEmail(mailOptions);
      console.log("Success: OTP successfully resent");
      i * 2;
      return res.status(200).send("Successfully resent OTP");
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
      });
    }
  },





//login verification
     userLogin: async(req,res)=>{
   const {email,password}=req.body;

   try{
    const user=await userdb.findOne({email})
    console.log("userhere" , user);

   if(!user){
    req.session.lock = "Invalid Email ID";
     return res.redirect("/login")
   }
    
   if(!user.status){
    req.session.blockuser="This Email Id Has Blocked";
    return res.redirect("/login")
   }
   const isPassword = await bcrypt.compare(password, user.password);
   console.log("Password match result:", isPassword); 

   if(isPassword){
    req.session.user = user.name;
    req.session.userId = user._id;
    return res.redirect("/")
   }else{
    req.session.lock="Invalid Email Password";
    return res.redirect("/login")
   }
   }catch(error){
     res.send("erooor")
   }
 },



}