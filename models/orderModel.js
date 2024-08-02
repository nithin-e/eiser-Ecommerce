const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;
const Product = require('../models/pruductModel'); 
const Userdb=require('../models/usermodel')

// Define the order schema
const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Userdb, 
    required: true,
  },
  products: [
    {
      productName:{
        type: String,
        required: true
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
        type: [String],
      },
      quantity: {
        type: Number,
        required: true,
      },
      productImage:{
        type: [String],
        required: true,
      },
      productPrice:{
        type: Number,
        required: true,
      },
      // status: {
      //   type: String,
      //   enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'PaymentFailed'],
      //   default: 'Pending',
      // },
      
    },
  ],
  address: {
    name:{
      type: String,
       requred:true
    },
    locality: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
  },
  totalprice: {
    type: Number,
    required: true,
  },
  orderDate : {
    type: String,
    required: true,
  },
  orderTime: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'PaymentFailed'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['Wallet', 'Razor Pay', 'Cash on Delivery'], 
    required: true,
  },
   CouponAmound:{
      type: Number
    },
    Itemstatus: {
      type: String,
      enum: ['Approved', 'Reject','Pending'],
       default: 'Pending'
    },
  returnReason:{type:String,default:'not Returned'},
  userRequest: {
    type: String,
    enum: ['Requested For Return', 'No Request Yet','Return Done','Return Rejected'],
    default: 'No Request Yet'
  }
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
