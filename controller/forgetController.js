const express = require("express");
const userdb = require("../models/usermodel");
const { sendEmail } = require("../util/nodemailer");
const genOtp = require("../util/otpgenarate");
const { resentOtp } = require("./userController");
const bcrypt = require("bcrypt");
const otpmodel = require("../models/otpmodel");
let i = 150;
module.exports = {
  renderforgetpage: (req, res) => {
    let err = null;
    if (req.session.err) {
      err = req.session.err;
      req.session.err = null;
    }
    res.render("user/forgetEmail", { err });
  },

  showOtpPage: (req, res) => {
    let errMess = null;
    if (req.session.errMess) {
      errMess = req.session.errMess;
      req.session.errMess = null;
    }

    res.render("user/otpone", { errMess });
  },

 

  //store user database
  forgetmail: async (req, res) => {
    const { email } = req.body;
    
    try {
      // Checking whether user already exists
      const existingUser = await userdb.findOne({ email: email });

      if (!existingUser) {
       
         req.session.err = "INVALID EMAIL ADDRESS"
       
         return res.redirect("/forgetpass");
      } else {
        
        req.session.email = email;
        
      }

      const { otpcode, otpExpires } = await genOtp();
      
console.log(otpcode);

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
      res.redirect("/created");



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
  verifyingOtp: async (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;

    const email = req.session.email;

    const otpcode = [otp1, otp2, otp3, otp4].join("");
    console.log("Received OTP:", otpcode, "for email:", email);

    try {
      const user = await otpmodel.findOne({ email });
     
      console.log("ourotp", otpcode, "hassed", user.email);
      const isMatch = await bcrypt.compare(otpcode, user.otpcode);

      console.log("ismatch1", isMatch);
      if (!isMatch) {
        req.session.errMess = "Invalid OTP";
        return res.redirect("/created");
      }
      await otpmodel.deleteOne({ email: email });
      const lock = req.session.lock;
           req.session.lock = null;
           res.render("user/change-password", { lock });
    } catch (error) {
      console.log(error);
      if (!res.headersSent) {

        req.session.errMess = "An error occurred during OTP verification";

        return res.redirect("/created");
      }
    }
  },







  //resent otp
  resentOtpforget: async (req, res) => {
    const email= req.session.email
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



  //password change
  passchange: async (req, res) => {
    const email= req.session.email
    const { "confirm-password": confirmPassword } = req.body;

    console.log("Request :", req.body);
    try {
      const user = await userdb.findOne({ email });
      console.log("Request :", user);
      if (!user) {
        req.session.lock = "Invalid Email ID";
        return res.redirect("/verify-otp-page");
      }

      console.log("Hashing password...");
      // Hash the new password
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(confirmPassword, salt);
      console.log("Hashed password:", hashedPassword);

      user.password = hashedPassword;

      // Save the updated user
      await userdb.findOneAndUpdate({email},{password:user.password})

      console.log(" pass word change succes fully");

      res.redirect("/login");
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};
