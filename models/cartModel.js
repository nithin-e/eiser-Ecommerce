const mongoose = require("mongoose");
const product = require('../models/pruductModel');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    cartProducts: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: product 
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
            Grandtotal: {
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
        }
    ]
});

const Carts = mongoose.model("Carts", cartSchema);

module.exports = Carts;
