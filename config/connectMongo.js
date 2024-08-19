// const mongoose = require('mongoose');
// require('dotenv').config();

// const uri = process.env.DB_URL;

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((err) => {
//     console.error('Error connecting to MongoDB:', err);
//   });

// module.exports=mongoose;



const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DB_URL;
console.log("uriiiii",uri)

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }) // Added timeout
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

module.exports = mongoose;
