const Userdb = require("../../models/usermodel");
const CATMOD = require("../../models/categorymodel");
const BRANDMOD=require("../../models/brandsModel")
const Product=require("../../models/pruductModel")
const cloudinary=require("../../config/cloudinaryConfig")
const formidable=require("formidable")
const fs =require("fs");
const path = require("path");

const credentials = {
  email: "admin@gmail.com",
  password: "123",
};

module.exports = {
  ///showing admin login
  adminlogin: (req, res) => {
    const lock = req.session.lock;
    req.session.lock = null;
    res.render("admin/admin_login", { lock });
  },

  // chekking email and pass word
  adminloginSubmit: (req, res) => {
    const { email, password } = req.body;
    if (credentials.email == email && credentials.password == password) {
      res.render("admin/admin-home");
    } else {
      req.session.lock = "INVALID ENTRY";
      res.redirect("/admin_login");
    }
  },

  //showing home page
  adminHome: (req, res) => {
    res.render("admin/admin-home");
  },



  showCategory: async (req, res) => {
    try {
      const suss = req.session.suss;
      req.session.suss = null;
          const cateditUp=  req.session.cateditUp
          req.session.cateditUp=null

        const  alreadythre= req.session.alreadythre
        req.session.alreadythre=null
      const allCat = await CATMOD.find();
      res.render("admin/category", { suss, allCat,cateditUp,alreadythre });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },

  //mange user management
  userManagement: async (req, res) => {
    try {
      const alluser = await Userdb.find();
      // console.log("alluser is here", alluser);
      res.render("admin/userManegement", { alluser });
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  brandManagement:async (req, res) => {
    try{
     const dbbrands= await BRANDMOD.find()
    //  console.log(dbbrands);
     const brandAdded=req.session.brandAdded
     req.session.brandAdded=null

     const nmeund=req.session.nmeund
     req.session.nmeund=null

     const doneupdate= req.session.doneupdate
     req.session.doneupdate=null

     res.render("admin/brands",{dbbrands,brandAdded,nmeund,doneupdate});
    } catch(error){
      console.error("Error retrieving users:", error);
      res.status(500).send("Internal Server Error");
    }

     
  },

  //using ajax this route details coming from frond end
  blockuser: async (req, res) => {
    const { id } = req.params;
    console.log(id, "passed id");
    try {
      const user = await Userdb.findById(id);
      console.log(user, "haaaaaa");
      if (!user) {
        console.error("user no", Error);
      } else {
        var msg;
        if (user.status == true) {
          console.log("succesfull blocked");
          await Userdb.updateOne({ _id: id }, { $set: { status: false } });
          msg = "user blocked";
        } else {
          console.log("succesfull unblocked");
          await Userdb.updateOne({ _id: id }, { $set: { status: true } });
          msg = "user unblocked";
        }
      }

      res.json({ msg: `${msg}succesfuly....`, success: true });
    } catch (error) {
      console.log(error);
    }
  },

  updateCat: (req, res) => {
           const exisist= req.session.exisist
           req.session.exisist=null
    res.render("admin/addcategoryForm",{exisist});
  },



  // add category and show succes messege in frond end
  storedb: async (req, res) => {
   let { name } = req.body;
    name=name.toLowerCase();
    console.log('fylll hyuiii',name);
    try {
      const Cat = await CATMOD.findOne({ name });
      console.log('thsiu is already here',Cat);
      if (Cat) {
      //  const exisist= req.session.exisist
      //  req.session.exisist=null
      req.session.exisist="already exisist"
        res.redirect("/updateCat")
      } else {
        let lower = name.toLowerCase();
        await CATMOD.create({ name: lower});
        req.session.suss = "succesfully added";
        res.redirect("/category");
        console.log("category added");
      }
    } catch (error) {
      console.log("suppeerrrrrr",error);
      res.status(500).json({ error: "An error occurred" }); 
    }
  },
 



  //edit category 
  editCategory: async (req, res) => {
    const { id } = req.params;
    console.log("settalle",id);
    try {  
      const catry = await CATMOD.findById(id);
      console.log("thi ir", catry);
      if (catry) {
        // console.log("thi is the user", catry);
        res.render("admin/categoryedit",{catry});
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      res.status(500).json({ error: "An error occucsssdddddddddddddddddddddddddrred" });
    }
  },


  //edit datas store data base
applyChanges:async(req,res)=>{
  const {id,name}=req.body
  console.log("aaaaaa this mee",name);
  try{
    const already= await CATMOD.findOne({name})
    console.log("here here",already);
    if(already){
      console.log("here both name are same",already.name,"and",name);
      req.session.alreadythre="This Category Already There"
      console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
       res.redirect("/category")
      
    }else{
      console.log("enth thengaaanu")
      await CATMOD.findByIdAndUpdate(id,{name},{new:true})
   
     req.session.cateditUp="Category SuccesFully Updated"
     res.redirect("/category")
    }
    
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurffffffffffffred" });
  }
},


//block category
Blockcategory:async(req,res)=>{
  
  const { id } = req.params;
  console.log("heyyyyyyyyyyyyyy",id);
  try {
    const existsID= await CATMOD.findById(id)
    if(!existsID){
      res.send("this id not ter")
    }else{
      var msg
      if(existsID.status){
        console.log("here status==true so ");
        await CATMOD.findByIdAndUpdate(id,{status:false},{new:true})
        msg="succusfully blocked"
        console.log("succesfull blocked");
      }else{
        await CATMOD.findByIdAndUpdate(id,{status:true},{new:true})
        msg="succesfully unblocked"
        console.log("succesfull unblocked");
      }
    }
    res.json({msg:`${msg}succesfully...`,success:true})
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
},



//add brands form showing
addbrands:async(req,res)=>{ 
    const alredhave=req.session.alredhave
    req.session.alredhave=null

  res.render("admin/addBrandsForm",{alredhave})

},


//store brand data in db
storeBrandData:async (req,res)=>{
   let {name}=req.body
   console.log("ddddddddddddd",name);
   name=name.toLowerCase();
   try {
   
    const brandIn = await BRANDMOD.findOne({ name :name});
            // console.log(brandIn,'lololololo');
    if(brandIn){
    console.log("already thre");
    req.session.alredhave="This Brand Already There"
    res.redirect("/addbrands")
    }else{
     const low=name.toLowerCase()
      await BRANDMOD.create({name:low})
   console.log("succesfully brand added");
   req.session.brandAdded="SuccesFully Brand added"
  res.redirect("/showBrand")
    }
   } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
   }
},

editBrantPage:async(req,res)=>{
  const {id}=req.params
  console.log(id,"id kittyyyyyy");
  try {
    const brandDetails= await BRANDMOD.findById(id)
    
    if(brandDetails){
      // console.log("ibade nokkado",brandDetails);
      res.render("admin/BrandEditPage",{brandDetails})
    } 
  } catch (error) {
    res.status(500).json({ error: "An error occurred" }); 
  }
},


//apply bottton
BrandBotton:async(req,res)=>{
  let {id,name}=req.body
   name=name.toLowerCase()
  console.log("id ibadem kittand",id);
   try {
    const brandmon= await BRANDMOD.findOne({name})
    console.log("hey ibade nokkada",brandmon);
    if(brandmon){
      req.session.nmeund="This Brand AlReady Exisist"
      res.redirect("/showBrand")
    }else{
      await BRANDMOD.findByIdAndUpdate(id,{name},{new:true})
      console.log("updateSucces fully complte");
      req.session.doneupdate="SuccessFully BrandUpdated"
      res.redirect("/showBrand")
    }
   } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" }); 
   }
},


blockUnblockbrand:async(req,res)=>{
  const {id}=req.params
  console.log("this is id",id);
  const BrandIn= await BRANDMOD.findById(id)
   try{
    if(!BrandIn){
      res.send("id is not there")
    }else{
      console.log(BrandIn.status,"hey hey hey");
      var msg
      if(BrandIn.status){
        await BRANDMOD.findByIdAndUpdate(id,{status:false},{new:true})
        msg="SuccesFully Blocked"
        console.log("blocked");
      }else{
        await BRANDMOD.findByIdAndUpdate(id,{status:true},{new:true})
        msg="SuccesFully UNblocked"
        console.log("Unblocked");
      }
    }
    res.json({msg:`${msg}succesfully...`,success:true})
   }catch(err){
    console.log(error);
    res.status(500).json({ error: "An error occurred" }); 
   }
},



  //showing productpage
  showProductPage: async(req, res) => {
      try {
        
   const Allprod= await Product.find().populate("category").populate('brand')
   
   console.log('all items',Allprod);
        const ProIn= req.session.ProIn
        req.session.ProIn=null
     
         const sussAdd=req.session.sussAdd
         req.session.sussAdd=null
         res.render("admin/pruductsPage",{Allprod,ProIn,sussAdd});
      } catch (error) {
        console.error('Error while adding product:', error);
        res.status(500).send('Internal Server Error');
      }
   },


//showing add poduct page
AddProductPage:async(req,res)=>{
  const allcats= await CATMOD.find()
  const allbrands= await BRANDMOD.find()
  res.render("admin/addProduct",{allcats,allbrands})
},

//storing product datas in db 
 PressAddproductButton : async (req, res) => {

  const form = new formidable.IncomingForm();
  const uploadDir = path.join(__dirname, '../uploads');

  // Check if the upload directory exists, create it if it doesn't

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).send('Error occurred while parsing the form');
    }
    const productName = fields.productName ? fields.productName[0] : '';
    const description = fields.description ? fields.description[0] : '';
    const stockQuantity = parseInt(fields.stockQuantity ? fields.stockQuantity[0] : '0', 10);
    const category = fields.category ? fields.category[0] : '';
    const brand = fields.brand ? fields.brand[0] : '';
    const price = parseFloat(fields.price ? fields.price[0] : '0');
  

    console.log('productName:', productName);
    console.log('description:', description);
    console.log('stockQuantity:', stockQuantity);
    console.log('category:', category);
    console.log('brand:', brand);
    console.log('price:', price);



    // Ensure `files.productImg` exists and is an array
    if (!files.productImg || !Array.isArray(files.productImg)) {
      console.error('Invalid file data:', files.productImg);
      return res.status(400).send('Invalid file data');
    }

    const imageFile = path.normalize(files.productImg[0].filepath);

    
      try {
        console.log('File exists, attempting to upload:', imageFile);

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(imageFile, { folder: 'uploads' });
        console.log('Upload successful');

        // Extract the URL from the Cloudinary response
        const imageUrl = result.secure_url;
       

        // Create a new Product instance using the form data
        const newProduct = new Product({
          productName,
          images:[imageUrl],
          description,
          stockQuantity,
          category,
          brand,
          price
        });

        await newProduct.save();
        console.log("succefully uploaded",newProduct);
        // Delete the local file after upload
        fs.unlinkSync(imageFile); 
        req.session.sussAdd="Product SuccesFully Added"
           res.redirect("/pruduct-page")
      } catch (error) {
        console.error('Error while adding product:', error);
        res.status(500).send('Internal Server Error');
      }
    });

 }
}
