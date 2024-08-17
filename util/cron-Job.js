const cron = require("node-cron");
const moment = require('moment');
const Product = require("../models/pruductModel");

async function removeOffer() {
  console.log("Cron job started");
  try {
    const currentDate = moment().startOf('day');

    const expiredOffers = await Product.find({ offerDate: { $lte: currentDate } });
    if (expiredOffers.length > 0) {
      for (const product of expiredOffers) {
        product.offerPrice = 0;
        product.offerDate = new Date(0);
        await product.save();
      }
      console.log(`Removed offers from ${expiredOffers.length} products`);
    } else {
      console.log("No expired offers found");
    }
  } catch (err) {
    console.log("Error in removeOffer function:", err);
  }
}



cron.schedule("* * * * *", async () => {  // Runs every 5 minutes
  try {
    console.log("Cron job triggered");
    await removeOffer();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});




module.exports = {};  
