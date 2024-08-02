const mongoose = require('mongoose');
const path=require('path')
const Order = require('../../models/orderModel');
const generateSalesPDF=require('../../util/salesPdfCreator')
const pdf=require('../../util/salesReportCretor')





const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

const startOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(start.setDate(diff));
};



function formatDateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}











module.exports = {
    AdminChart: async (req, res) => {
        console.log('Period from query:', req.query); 
       
try {
    const period = req.query.period || 'all'; 
    let startDate;
    let endDate = new Date();

   
    switch (period) {
        case 'day':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate = startOfWeek(new Date());
            break;
        case 'month':
            startDate = new Date();
            startDate.setDate(1);
            break;
        case 'year':
            startDate = new Date();
            startDate.setMonth(0, 1);
            break;
        case 'all':
            startDate = new Date(0); 
            break;
        default:
            return res.status(400).json({ error: 'Invalid period' });
    }


    const startISODate = formatDate(startDate);
    const endISODate = formatDate(endDate);

    const salesData = await Order.aggregate([
        {
            $addFields: {
               
                orderDate: {
                    $dateFromString: {
                        dateString: "$orderDate",
                        format: "%d-%m-%Y"
                    }
                }
            }
        },
        {
            $match: {
                orderDate: { $gte: new Date(startISODate), $lte: new Date(endISODate) }
            }
        },
        {
            $unwind: "$products"
        },
        {
            $group: {
                _id: period === 'day' ? "$orderDate" : {
                    $dateToString: {
                        format: period === 'month' ? "%Y-%m" : "%Y-%m-%d",
                        date: "$orderDate"
                    }
                },
                totalSales: { $sum: "$products.productPrice" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    console.log('Sales Data:', salesData);
            res.json(salesData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    downloadSalesReport: async (req, res) => {
        try {
            const { startdate, enddate, downloadformat } = req.body;
            const startDate = new Date(startdate);
            const endDate = new Date(enddate);
            endDate.setHours(23, 59, 59, 999);
    
            // Check if dates are valid
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date provided' });
            }
    
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);
    
            // Construct the query
            const formattedStartDatee = startDate;
            const formattedEndDatee = endDate;

            const startFormat = formatDateToDDMMYYYY(formattedStartDatee)
            const endFormat = formatDateToDDMMYYYY(formattedEndDatee)
            console.log('Formatted Start Date:', startFormat);
            console.log('Formatted End Date:', endFormat);
    
            // Query for orders
            const orders = await Order.find({
                status: "Delivered",
                orderDate: {
                    $gte: startFormat,
                    $lte: endFormat
                }
            });
    
            console.log('Orders:', orders);
    
            if (orders.length === 0) {
                return res.status(404).json({ error: 'No orders found for the given date range' });
            }
    
            if (downloadformat === 'pdf') {
                console.log('Generating PDF report...');
                const pdfBuffer = await generateSalesPDF(orders, startFormat, endFormat);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
                return res.status(200).end(pdfBuffer);
               
            } else {
                console.log('Generating report in other format...');
                let totalSales = orders.reduce((total, order) => total + (order.totalprice || 0), 0);
                return pdf.downloadReport(
                    req,
                    res,
                    startDate,
                    endDate,
                    orders,
                    totalSales.toFixed(2),
                    downloadformat
                );
            }
    
        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
    
}