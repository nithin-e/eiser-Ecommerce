const express = require("express");
const adminController = require("../../controller/admin/adminController");
const { adminAuth, veryfyAdmint } = require("../../middleware/adminmiddleware");
const upload=require("../../config/multerConfig")
const OrderManageMent=require('../../controller/admin/OrderManageMent')
const CouponManageMent=require('../../controller/admin/couponManageMentController')
const ReturnManageMent=require('../../controller/admin/returnProductManageMent')
const adminChartController=require('../../controller/admin/adminChartController')

const multer = require("multer");
// const orderController = require("../../controller/orderController");


const adminrouter = express.Router();

adminrouter.get("/admin_login",adminAuth, adminController.adminlogin);

adminrouter.post("/admin_login", adminController.adminloginSubmit);

adminrouter.get("/admin_home", veryfyAdmint, adminController.adminHome);

adminrouter.get("/pruduct-page", veryfyAdmint, adminController.showProductPage);

adminrouter.get("/category", veryfyAdmint, adminController.showCategory);

adminrouter.get("/user", veryfyAdmint, adminController.userManagement);

adminrouter.get("/showBrand", veryfyAdmint, adminController.brandManagement);

//user block and unblock comming from ajax
adminrouter.patch("/blockuser/:id", veryfyAdmint, adminController.blockuser);

//addcategory form getting
adminrouter.get("/updateCat",veryfyAdmint, adminController.updateCat);

adminrouter.post("/storeCatt", veryfyAdmint, adminController.storedb);

//edit category
adminrouter.get("/editCat/:id",veryfyAdmint, adminController.editCategory);

//edit update
adminrouter.post("/applyChanges", veryfyAdmint, adminController.applyChanges);

//block category
adminrouter.patch("/blockCategory/:id", veryfyAdmint, adminController.Blockcategory);

//add brands form showing
adminrouter.get("/addbrands",veryfyAdmint, adminController.addbrands);

//take brand details
adminrouter.post("/storeBrandsdb", veryfyAdmint, adminController.storeBrandData);

//geting brand edit page
adminrouter.get("/editBrand/:id",veryfyAdmint, adminController.editBrantPage);

//user click apply change botton
adminrouter.post("/BrandApplyBotton", adminController.BrandBotton);

//block and unlock comming from ajax
adminrouter.patch("/blockbrand/:id", veryfyAdmint, adminController.blockUnblockbrand);

//showing addproducr page
adminrouter.get("/addProducts",veryfyAdmint, adminController.AddProductPage);

//getting product details in post method

adminrouter.post( "/pressAddproduct",upload.array("productImg", 3),veryfyAdmint, adminController.PressAddproductButton);


///logout  admin
adminrouter.get("/adminlogout", adminController.adminLOgout);

//edit product  passing is queryparams
adminrouter.get("/editProduct/:id",veryfyAdmint, adminController.editProducts);
// adminrouter.post('/editImage/:id',adminController.editImages)
adminrouter.post('/replaceProductImage',upload.single('croppedImage'),adminController.replaceProductImage)


//succes editproduct botton
adminrouter.post("/ediProductSucces/:id", veryfyAdmint,upload.array("productImg", 6), adminController.editBottom);
adminrouter.patch("/blockproduct/:id", veryfyAdmint, adminController.blockUnblockProduct);

//order Management
adminrouter.get('/Order-Page',veryfyAdmint,OrderManageMent.ShowOrderPage)
adminrouter.post('/update-order-status',veryfyAdmint,OrderManageMent.ChangeOrderStatus)
    

//coupon mangement
adminrouter.get('/Coupon-page',CouponManageMent.ShowCouponPage)
adminrouter.post('/Add-Coupon',CouponManageMent.AddCoupon)
adminrouter.post('/delete-Coupon/:id',CouponManageMent.DeleteCoupon)
adminrouter.post('/edit-Coupon',CouponManageMent.EDITCOUPON)


//return Management
adminrouter.get('/ReturnProduct',ReturnManageMent.ShowReturnProduct)
adminrouter.post('/updateOrderStatus/:id',ReturnManageMent.UpdateOrderStatus)


//admindashboard

adminrouter.get('/api/sales-data',adminChartController.AdminChart)

adminrouter.post('/salesreport', adminChartController.downloadSalesReport);



module.exports = adminrouter;
