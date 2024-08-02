const { session } = require("passport");
const userdb = require("../models/usermodel");
const otpmodel = require("../models/otpmodel");
const { render } = require("../app");
const genOtp = require("../util/otpgenarate");
const { sendEmail } = require("../util/nodemailer");
const bcrypt = require("bcrypt");
const Product = require("../models/pruductModel");
const CATMOD = require("../models/categorymodel");
const BRANDMOD = require("../models/brandsModel");
const CARTMOD = require("../models/cartModel");
const Category = require("../models/categorymodel");
const mongoose = require("mongoose");
const Wishlist = require("../models/WishlistModel");
const walletModel=require('../models/walletModel')
const ObjectId = mongoose.Types.ObjectId;

let i = 150;
module.exports = {
  homepage: async (req, res) => {
    const perPage = 10;
    let page = parseInt(req.query.page) || 1;

    if (page < 1) {
      page = 1;
    }

    const user = req.session.user;
    req.session.nouser = null;

    try {
      const allProduct = await Product.find()
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("category")
        .populate("brand");

      const userinfo = req.session.userinfo;
      const count = await Product.countDocuments();
      const cartError = req.session.cartError;
      delete req.session.cartError;

      res.render("user/user_home", {
        user: user,
        allProduct: allProduct,
        userinfo: userinfo,
        cartError: cartError,
        current: page,
        pages: Math.ceil(count / perPage),
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Internal Server Error");
    }
  },

  login: (req, res) => {
    const lock = req.session.lock;
    req.session.lock = null;

    const success = req.session.success;
    req.session.success = null;

    const blockuser = req.session.blockuser;
    req.session.blockuser = null;

    const googleblock = req.session.googleblock;
    req.session.googleblock = null;

    const noUserFound = req.session.noUserFound;
    req.session.noUserFound = null;
    res.render("user/user_login", {
      lock,
      blockuser,
      googleblock,
      noUserFound,
    });
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
    res.render("user/otp", { errMess });
  },

  //store user database
  registerUser: async (req, res) => {
    console.log("ibde ethi");
    const { name, password, email } = req.body;
    try {
      console.log("user  indada");
      // Checking whether user already exists
      const existingUser = await userdb.findOne({ email: email });

      if (existingUser) {
        console.log("user indada athavum seen");
        req.session.nouser =
          "This email is already registered. You can login with another one.";
        res.redirect("/loginandsignup");
      } else {
        console.log("user illatta but ");
        req.session.email = email;
        req.session.temp = { email, name, password };
        console.log("user illatta but ", req.session.temp);
        // req.session.user = name;
        const { otpcode, otpExpires } = await genOtp();
        console.log("otp", otpcode);

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
        req.session.checkOtpVerfy = true;
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
      }
    } catch (error) {
      console.error("Error in registerUser:", error);
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    }
  },

  //verify otp
  verifyOtp: async (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;

    const { password, email, name } = req.session.temp;

    const otpcode = [otp1, otp2, otp3, otp4].join("");
    console.log("Received OTP:", otpcode, "for email:", email);

    try {
      //  email = req.session.email
      const user = await otpmodel.findOne({ email });
      if (!user) {
        req.session.errMess = "Not user there"
        return res.redirect("/otp-page");
      }
      console.log("ourotp", otpcode, "hassed", user.email);
      const isMatch = await bcrypt.compare(otpcode, user.otpcode);

      console.log("ismatch1", isMatch);
      if (!isMatch) {
        req.session.errMess = "Invalid OTP";
        return res.redirect("/otp-page");
      }
      console.log("enthokke ivade nadakkane", req.session.temp);

      await otpmodel.deleteOne({ email: email });
     
      delete req.session.checkOtpVerfy;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userdata = await userdb.create({
        email: email,
        name: name,
        password: hashedPassword,
      });
      req.session.userId = userdata._id;
      console.log("kityada mone", req.session.userId);
      req.session.user = email;
      
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
    const email = req.session.email;
    console.log("this is from email", email);
    const userId = req.session.userId;
    //  const Usser = await userdb.findById(id)
    //   console.log("this is from email",Usser);
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
      console.log("Success: OTP successfully resent", otpcode);
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
  userLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await userdb.findOne({ email });
      console.log("userhere", user);

      if (!user) {
        req.session.lock = "Invalid Email ID";
        return res.redirect("/login");
      }

      if (!user.status) {
        req.session.blockuser = "This Email Id Has Blocked";
        return res.redirect("/login");
      }
      const isPassword = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isPassword);

      if (isPassword) {
        req.session.user = user.email;
        req.session.userId = user._id;
        req.session.userinfo = user;


        req.session.user = email;
        return res.redirect("/");
      } else {
        req.session.lock = "Invalid Email Password";
        return res.redirect("/login");
      }
    } catch (error) {
      res.send("erooor");
    }
  },

  //show product details page
  ShowProductDetails: async (req, res) => {
    console.log("hiii", req.params);
    const { id } = req.params;
    const userId = req.session.userId;
    console.log("hiii", userId);
    try {
      // const id = req.params.id.replace(':', '');

      const products = await Product.findById(id)
        .populate("brand")
        .populate("category");

      const allBrands = await BRANDMOD.find();
      const allproducts = await Product.find({ _id: { $ne: id } }).populate(
        "category"
      );

      const allcategory = await CATMOD.find();

      const FindUser = await CARTMOD.findOne({ userId: userId });

      if (FindUser) {
        console.log(" oke allehe", FindUser);
        console.log("if ill pettada");
        var CartExisistIndex = await FindUser.cartProducts.findIndex(
          (p) => p.productId.toString() == id
        );
        console.log("this is index inside block", CartExisistIndex);
        const user = req.session.user;

        const WishlistInfo=await Wishlist.find()
        const isProductInWishlist = WishlistInfo.some(item => item.productId.toString() === products._id.toString());
     

        res.render("user/productDetailsPage", {
          products,
          user,
          allproducts,
          allcategory,
          allBrands,
          CartExisistIndex,
          isProductInWishlist 
        });
      } else {
        console.log("else ill pettada");
        console.log("this is index inside block", CartExisistIndex);
        const user = req.session.user;
        
         const WishlistInfo=await Wishlist.find()
         const isProductInWishlist = WishlistInfo.some(item => item.productId.toString() === products._id.toString());
        
     
      
         console.log('------------',isProductInWishlist,'-------------');
        res.render("user/productDetailsPage", {
          products,
          user,
          allproducts,
          allcategory,
          allBrands,
          isProductInWishlist
        });
      }
    } catch (error) {
      console.error("Error while adding product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  //showing separate page
  showProductSeperetPage: async (req, res) => {
    const perPage = 8;
    const page = req.query.page || 1;

    try {
      // Fetch all products without any filters
      const totalProducts = await Product.countDocuments();
      const products = await Product.find()
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("category")
        .populate("brand");

      const allCategories = await Category.find();
      const allBrands = await BRANDMOD.find();
      const user = req.session.user;

      res.render("user/productList", {
        products,
        user,
        allCategories,
        allBrands,
        current: page,
        pages: Math.ceil(totalProducts / perPage),
        filters: {}, // No filters applied
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  },

  // filtering product

  filterProducts: async (req, res) => {
    console.log("Received query parameters:", req.query);

    const { brand, category, price } = req.query;
    console.log(
      "Extracted parameters - Brand:",
      brand,
      "Category:",
      category,
      "Price:",
      price
    );

    try {
      // Base filter for active products
      const filter = { status: true };

      // Adding brand filter if provided
      if (brand) {
        const brandNames=brand.split(',')
        const brandDocs=await BRANDMOD.find({name:{$in:brandNames}}).select('_id');
          const brandIds=brandDocs.map(doc=>doc._id)
        filter.brand = { $in: brandIds };
      }

      // Adding category filter if provided
      if (category) {
        const categoryNames = category.split(',');
        const categoryDocs = await CATMOD.find({ name: { $in: categoryNames } }).select('_id');
        const categoryIds = categoryDocs.map(doc => doc._id);
        filter.category = { $in: categoryIds };
      }

      // Adding price filter if provided
      if (price) {
        filter.price = { $lte: parseFloat(price) };
      }
      console.log("Constructed filter:", filter);

      const products = await Product.find(filter);
      
      console.log(
        "productsproductsproducts",
        products
      );

      // Respond with found products
      res.json({ success: true, products });
    } catch (error) {
      console.error("Error occurred while fetching products:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while fetching products.",
          error: error.message,
        });
    }
  },


  SearchingProduct: async (req, res) => {
    console.log("Request query:", req.query);

    try {
        const { inputValue } = req.query;
        console.log("Extracted inputValue:", inputValue);

        if (!inputValue) {
            return res.status(400).json({ success: false, message: "Input value is required" });
        }

        // Fetch category and brand concurrently
        const [category, brand] = await Promise.all([
            CATMOD.findOne({ name: { $regex: inputValue, $options: "i" } }),
            BRANDMOD.findOne({ name: { $regex: inputValue, $options: "i" } }),
        ]);

        console.log("Category found:", category);
        console.log("Brand found:", brand);

        // Build the search criteria
        const searchOptions = {
            status: true,
            isDeleted: false,
            $or: [
                { productName: { $regex: inputValue, $options: "i" } },
            ],
        };

        if (category) searchOptions.$or.push({ category: category._id });
        if (brand) searchOptions.$or.push({ brand: brand._id });

        console.log("Search options:", searchOptions);

        // Fetch products with related data
        const products = await Product.find(searchOptions)
            .populate("brand")
            .populate("category")
         

        console.log("Products found:", products.length);

        // Return found products
        return res.json({
            success: true,
            count: products.length,
            products: products
        });

    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
}