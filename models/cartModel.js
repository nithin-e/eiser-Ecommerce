const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    cartProducts: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product' 
            },
            quantity: {
                type: Number,
            },
            total: {
                type: Number,
            },
            subtotal: {
                type: Number,
                default: 0
            },
            productName: {
                type: String
            },
            images: {
              type: [String],
              required: true,
          },
          stockQuantity:{
            type: Number
          },

          categoryOffer:{
            type: String,
            default:0
           },
        }
        
    ],
    Grandtotal: {
        type: Number,
        default: 0
    },
});

const Carts = mongoose.model("Carts", cartSchema);

module.exports = Carts;
