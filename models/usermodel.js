const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            default: true
        },
        referalLink: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
