const mongoose = require("mongoose");

const brandsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const brands = mongoose.model("brands", brandsSchema);

module.exports = brands;
