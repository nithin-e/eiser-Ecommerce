const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
    },
    status: {
      type: Boolean,
      default: true,
    },
  
  offerPrice:{
    type: String,
    default:0
   },
  },
  {
    timestamps: true,
  }
);

const category = mongoose.model("categorys", categorySchema);

module.exports = category;
