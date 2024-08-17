const mongoose = require('mongoose');
const path=require('path')
const orderModel = require('../../models/orderModel');
const generateSalesPDF=require('../../util/salesPdfCreator')
const pdf=require('../../util/salesReportCretor');
const { OrderInfo } = require('../orderController');
const moment=require('moment')





function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}



function generateTimestamp(dateString) {
    const date = new Date(dateString);
    
    const currentTime = new Date();

    date.setUTCHours(currentTime.getUTCHours(), currentTime.getUTCMinutes(), currentTime.getUTCSeconds(), currentTime.getUTCMilliseconds());

    return date;
}










module.exports = {
    AdminChart: async (req, res) => {
        console.log('Period from query:', req.query);
        
        try {
            const period = req.query.period || 'all';
    
            // Get the current date in the local timezone
            const now = new Date();
            const offset = now.getTimezoneOffset();
            let startDate = new Date(now.getTime() - offset * 60 * 1000);
            let endDate = new Date(now.getTime() - offset * 60 * 1000);
            endDate.setHours(23, 59, 59, 999);
    
            switch (period) {
                case 'day':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(startDate.getDate() - startDate.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'year':
                    startDate = new Date(startDate.getFullYear(), 0, 1);
                    break;
                case 'all':
                    startDate = new Date(0);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid period' });
            }







            const formattedStartDate = formatDate(startDate); 
             const formattedEndDate = formatDate(endDate); 

             
    
            console.log('Start Date:',typeof( startDate));
            console.log('End Date:', endDate);
    
            const salesData = await orderModel.aggregate([
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
                        orderDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
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



    CoustemFilter: async(req,res)=>{
        const {startDate,endDate}=req.body
        try {
            
           
        
             
        
            const startDatee = generateTimestamp(startDate);
           const  endDatee = generateTimestamp(endDate);
           console.log('Start.... Date:',startDatee);
           console.log('End.... Date:', endDatee);
        
            const salesData = await orderModel.aggregate([
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
                        orderDate: { $gte: startDatee, $lte: endDatee }
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
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
        
            console.log('sales data oke ahhhno',salesData);
            
            res.json({success:true,salesData});
        
         } catch (error) {
            console.error('Error fetching sales data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
         }
        
        
        
            },







    downloadSalesReport: async (req, res) => {
        console.log('..................what is the problem.............................', req.body);
        try {
            const { startdate, enddate, downloadformat, timeInterval } = req.body;
            let startDate;
            let endDate;
    
            if (startdate && enddate) {
                startDate = new Date(startdate);
                endDate = new Date(enddate);
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
    
                const startFormat = formatDateToDDMMYYYY(formattedStartDatee);
                const endFormat = formatDateToDDMMYYYY(formattedEndDatee);
                console.log('Formatted Start Date:', startFormat);
                console.log('Formatted End Date:', endFormat);
    
                // Query for orders
                var orders = await orderModel.find({
                    orderDate: {
                        $gte: startFormat,
                        $lte: endFormat
                    }
                });
    
            } else if (timeInterval) {
                const now = moment();
                switch (timeInterval) {
                    case 'day':
                        startDate = now.startOf('day').toDate();
                        endDate = now.endOf('day').toDate();
                        break;
                    case 'week':
                        startDate = now.startOf('isoWeek').toDate();
                        endDate = now.endOf('isoWeek').toDate();
                        break;
                    case 'month':
                        startDate = now.startOf('month').toDate();
                        endDate = now.endOf('month').toDate();
                        break;
                    case 'year':
                        startDate = now.startOf('year').toDate();
                        endDate = now.endOf('year').toDate();
                        break;
                    default:
                        return res.status(400).json({ message: "Invalid time interval" });
                }
    
                // Construct the query
                const formattedStartDatee = startDate;
                const formattedEndDatee = endDate;
    
                var startFormat = formatDateToDDMMYYYY(formattedStartDatee);
                var endFormat = formatDateToDDMMYYYY(formattedEndDatee);
                console.log('Formatted Start Date:', startFormat);
                console.log('Formatted End Date:', endFormat);
    
                // Query for orders
                var orders = await orderModel.find({
                    orderDate: {
                        $gte: startFormat,
                        $lte: endFormat
                    }
                });

                console.log('oders',orders);
                
    
            } else {
                return res.status(400).json({ message: "Start date, end date, or time interval must be provided" });
            }
    
            if (!orders ||orders.length === 0) {
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
                    startFormat,
                    endFormat,
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
