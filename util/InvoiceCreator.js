const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (orderDetails) => {
    try {
        const formatDate = (date) => {
            return date ? new Date(date).toLocaleDateString('en-US') : '';
        };

        const deliveredProducts = orderDetails.products || []; // Ensure deliveredProducts is an array

        const data = {
            "customize": {},
            "images": {
                "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'img', 'fevicon.png'), 'base64'),
            },
            "sender": {
                "company": "Eiser",
                "address": "16501 Collins Ave, Sunny Isles Beach, FL 33160, India",
                "zip": "676503",
                "city": "Cochin",
                "country": "India"
            },
            "client": {
                "company": orderDetails.address.locality,
                "address": orderDetails.address.address,
                "zip": orderDetails.address.pincode,
                "city": orderDetails.address.city,
                "country": "India"
            },
            "information": {
                "order id": orderDetails._id,
                "date": formatDate(orderDetails.orderDate),
                "invoice date": formatDate(orderDetails.orderDate)
            },
            "products": deliveredProducts.map(product => ({
                "quantity": product.quantity.toString(),
                "description": product.productName,
                "tax-rate": 1,
                "price": product.productPrice
            })),
            "bottom-notice": "Thank you for choosing Eiser",
            "settings": {
                "currency": "INR",
                "tax-notation": "GST",
                "margin-top": 25,
                "margin-right": 25,
                "margin-left": 25,
                "margin-bottom": 25
            }
        };

        console.log("cc..............................2", data);
        const result = await easyinvoice.createInvoice(data);

        if (result.pdf) {
            const pdfPath = path.join(__dirname, '..', 'public', 'invoPdf', `${orderDetails.orderID}.pdf`);
            await fs.promises.writeFile(pdfPath, result.pdf, 'base64');
            console.log('Invoice PDF saved successfully:', pdfPath);
            return pdfPath;
        } else {
            console.error('Error generating PDF. Result:', result);
            return null;
        }

    } catch (error) {
        console.error('Error in generateInvoice:', error);
        return null;
    }
};

module.exports = { generateInvoice };
