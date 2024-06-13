const express=require("express")
const adminController = require("../../controller/admin/adminController")

const adminrouter=express.Router()


 adminrouter.get("/admin_login",adminController.adminlogin)


adminrouter.post("/admin_login",adminController.adminloginSubmit)

adminrouter.get("/admin_home",adminController.adminHome)

adminrouter.get("/pruduct-page",adminController.showProductPage)

adminrouter.get("/category",adminController.showCategory)

adminrouter.get("/user",adminController.userManagement)

adminrouter.get("/showBrand",adminController.brandManagement)


//user block and unblock comming from ajax
adminrouter.patch("/blockuser/:id",adminController.blockuser)

//addcategory form getting
adminrouter.get("/updateCat",adminController.updateCat)


adminrouter.post("/storeCatt",adminController.storedb)

//edit category
adminrouter.get("/editCat/:id",adminController.editCategory)

//edit update
adminrouter.post("/applyChanges",adminController.applyChanges)

//block category
adminrouter.patch("/blockCategory/:id",adminController.Blockcategory)

//add brands form showing
adminrouter.get("/addbrands",adminController.addbrands)

//take brand details
adminrouter.post("/storeBrandsdb",adminController.storeBrandData)

//geting brand edit page
adminrouter.get("/editBrand/:id",adminController.editBrantPage)

//user click apply change botton
adminrouter.post("/BrandApplyBotton",adminController.BrandBotton)

//block and unlock comming from ajax
adminrouter.patch("/blockbrand/:id",adminController.blockUnblockbrand)

//showing addproducr page
adminrouter.get("/addProducts",adminController.AddProductPage)

//getting product details in post method
adminrouter.post("/pressAddproduct",adminController.PressAddproductButton)




module.exports = adminrouter