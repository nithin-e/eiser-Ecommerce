const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            requred:true
        },
        email: {
            type: String,
            unique: true,
            requred:true
        },
        password: {
            type: String,
            requred:true
        },
        status:{
            type:Boolean,
            default:true
        }
    },
    {
        timestamps: true,
    },
   
);


// userSchema.pre('save',async function (next){
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = await bcrypt.hash(this.password, salt)
// })

const user = mongoose.model('User', userSchema);

//Export the model
module.exports = user