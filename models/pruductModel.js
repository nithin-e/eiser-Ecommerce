const mongoose = require('mongoose');
const category = require('./categorymodel');
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categorys',
        required: true
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'brands',
        required: true
    },
    updateDate: {
        type: Date,
        default: Date.now
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
   offerPrice:{
    type: Number,
    default:0
   },
   offerDate:{
    type:Date
   },
   categoryOffer:{
    type: String,
    default:0
   },
    status: {
    type: Boolean,
    default: true,
  },
    
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
