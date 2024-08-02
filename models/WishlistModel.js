const mongoose=require('mongoose')
const Userdb=require('../models/usermodel')
const Product=require('../models/pruductModel')


const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: Userdb, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: Product, required: true },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;