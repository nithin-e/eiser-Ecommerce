const mongoose = require('mongoose');

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys',
        required: true
    },
    brand: {
      type: mongoose.Types.ObjectId,
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
    
   },
   offerDate:{
    type:Date
   },
    status: {
    type: Boolean,
    default: true,
  },
    
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
