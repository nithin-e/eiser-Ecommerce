// const mongoose=require('mongoose')
// const userdb=require('../models/usermodel')
// const walletSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true,
//   },
//   balance: {
//     type: Number,
//     default: 0,
//   },
//   transation: [
//     {
//       amount: { type: Number },
//       reason: { type: String },
//       type: { type: String },
//       date: { type: Date },
//     }]
  
// });

// const walletModel= mongoose.model('walletModel',walletSchema)
// module.exports=walletModel

const mongoose=require('mongoose');
const User =require('../models/usermodel');
const Order = require("../models/orderModel");
const Product = require("../models/pruductModel");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      transaction_id: {
        type: String,
        unique: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      orderId: {
        type:String,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Wallet = mongoose.model("walletModel", walletSchema);

module.exports = Wallet;