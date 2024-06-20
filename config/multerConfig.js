// const multer = require("multer");

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads"); // Ensure "uploads" folder exists
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.filename}.jpg`);
//     }
// });

// const upload = multer({ storage: storage });
// module.exports = upload;




const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads"); // Ensure "uploads" folder exists
    },
    filename: (req, file, cb) => {
        const name = path.parse(file.originalname).name;
        console.log("nnnname",name); // Get the original file name without extension
        console.log("parse",path.parse(file.originalname)); 
        cb(null, `${Date.now()}-${name}.jpg`); // Save all files with a .jpg extension
    }
});

const upload = multer({ storage: storage });
module.exports = upload;



