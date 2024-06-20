const express = require("express");
const adminController = require("../../controller/admin/adminController");
const { adminAuth, veryfyAdmint } = require("../../middleware/adminmiddleware");
const upload=require("../../config/multerConfig")

const multer = require("multer");


const adminrouter = express.Router();

adminrouter.get("/admin_login", adminAuth, adminController.adminlogin);

adminrouter.post("/admin_login", adminController.adminloginSubmit);

adminrouter.get("/admin_home", veryfyAdmint, adminController.adminHome);

adminrouter.get("/pruduct-page", veryfyAdmint, adminController.showProductPage);

adminrouter.get("/category", veryfyAdmint, adminController.showCategory);

adminrouter.get("/user", veryfyAdmint, adminController.userManagement);

adminrouter.get("/showBrand", veryfyAdmint, adminController.brandManagement);

//user block and unblock comming from ajax
adminrouter.patch("/blockuser/:id", adminController.blockuser);

//addcategory form getting
adminrouter.get("/updateCat", adminController.updateCat);

adminrouter.post("/storeCatt", adminController.storedb);

//edit category
adminrouter.get("/editCat/:id", adminController.editCategory);

//edit update
adminrouter.post("/applyChanges", adminController.applyChanges);

//block category
adminrouter.patch("/blockCategory/:id", adminController.Blockcategory);

//add brands form showing
adminrouter.get("/addbrands", adminController.addbrands);

//take brand details
adminrouter.post("/storeBrandsdb", adminController.storeBrandData);

//geting brand edit page
adminrouter.get("/editBrand/:id", adminController.editBrantPage);

//user click apply change botton
adminrouter.post("/BrandApplyBotton", adminController.BrandBotton);

//block and unlock comming from ajax
adminrouter.patch("/blockbrand/:id", adminController.blockUnblockbrand);

//showing addproducr page
adminrouter.get("/addProducts", adminController.AddProductPage);



//getting product details in post method

adminrouter.post( "/pressAddproduct",upload.array("productImg", 3), adminController.PressAddproductButton);

 


///logout  admin
adminrouter.get("/adminlogout", adminController.adminLOgout);

//edit product  passing is queryparams
adminrouter.get("/editProduct/:id", adminController.editProducts);

//succes editproduct botton
adminrouter.post("/ediProductSucces",upload.array("productImg", 6), adminController.editBottom);

adminrouter.get("/ViewProduct", adminController.ShowProductDetails);



module.exports = adminrouter;
