const mongoose = require('mongoose');
const Userdb = require('./usermodel'); 

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
});

const userAddressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Userdb, 
        required: true,
    },
    addresses: [addressSchema]
});

const Address = mongoose.model("Address", userAddressSchema);

module.exports = Address;
