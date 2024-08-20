const Userdb=require("../models/usermodel")
const bcrypt = require("bcrypt");
module.exports = {
    googleLoginSucces: async (req, res) => {
        
        try {
          console.log('req.user:', req.user);
          
          if (!req.user) {
            console.log('No user data found in request');
            return res.redirect('/login?message=No user data found');
          }
      
          const { displayName, emails, name } = req.user;
          const email = emails[0].value;
          const userName = name.givenName || displayName;
      
          let user = await Userdb.findOne({ email });
      
          if (user) {
            if (user.status) {
              // Existing user, active
              req.session.user = displayName;
              req.session.userGoogleLogged = true;
              req.session.name = userName;
              req.session.email = email;
              req.session.userId = user._id;
              return res.redirect("/");
            } else {
              // Existing user, blocked
              req.session.googleblock = "This email id has been blocked";
              return res.redirect("/login");
            }
          } else {
            // New user
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
            user = await Userdb.create({
              name: userName,
              email: email,
              password: hashedPassword,
              status: true
            });
      
            req.session.user = displayName;
            req.session.userGoogleLogged = true;
            req.session.name = userName;
            req.session.userId = user._id;
            req.session.email = email;
            return res.redirect('/');
          }
        } catch (error) {
          console.error('Error during Google authentication success handling:', error);
          return res.redirect('/login?message=Google authentication failed');
        }
      }
    }




