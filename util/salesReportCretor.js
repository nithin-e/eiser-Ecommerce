const ejs = require('ejs');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const exceljs = require('exceljs');
const { format, isValid } = require('date-fns');
const Orders = require('../models/orderModel');
const PDFDocument = require('pdfkit');
const generateSalesPDF=require('../util/salesPdfCreator')

// Utility functions
const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

const validateDate = (date) => {
    const parsedDate = new Date(date);
    if (!date || !isValid(parsedDate) || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date provided');
    }
    return parsedDate;
};

const queryOrders = async (startDate, endDate) => {
    return Orders.find({
        PaymentStatus: "Paid",
        orderDate: { 
            $gte: startDate, 
            $lte: new Date(endDate).setHours(23, 59, 59, 999)
        }
    }).populate("products.product");
};

const sendErrorResponse = (res, statusCode, message) => {
    console.error(`Error: ${message}`);
    res.status(statusCode).send(message);
};

// Assume these functions are implemented elsewhere
// const generateExcelReport = async (orders, startDate, endDate) => {
//     // Implementation here
// };


// Main controller functions
const downloadReport = async (req, res, startDate, endDate, totalSales, downloadFormat) => {
    try {
        console.log('Input dates:', { startDate, endDate });

        const validatedStartDate = validateDate(startDate);
        const validatedEndDate = validateDate(endDate);

        // const formattedStartDate = formatDate(validatedStartDate);
        // const formattedEndDate = formatDate(validatedEndDate);
        
        console.log('Formatted dates:', { formattedStartDate, formattedEndDate });

        const totalAmount = parseInt(totalSales);
        console.log('Total Sales:', totalAmount);

        const orders = await queryOrders(validatedStartDate, validatedEndDate);
        console.log(`Found ${orders.length} orders`);

        if (downloadFormat === 'excel') {
            const excelFilePath = await generateExcelReport(orders, validatedStartDate, validatedEndDate);
            res.status(200).download(excelFilePath);
        } else if (downloadFormat === 'pdf') {
            const pdfBuffer = await generateSalesPDF( validatedStartDate, validatedEndDate,orders);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
            res.status(200).send(pdfBuffer);
        } else {
            throw new Error('Invalid download format');
        }
    } catch (error) {
        sendErrorResponse(res, 400, `Error generating report: ${error.message}`);
    }
};

const downloadSalesReport = async (req, res) => {
    try {
        const { startdate, enddate, downloadformat } = req.body;
        
        console.log('Received dates:', startdate);

        // Ensure startdate and enddate are arrays or single values
        const startDate = Array.isArray(startdate) ? startdate[0] : startdate;
        const endDate = Array.isArray(enddate) ? enddate[0] : enddate;

        console.log('Processed dates:', { startDate, endDate });

        // Validate and handle dates
        if (!startDate || !endDate) {
            throw new Error('Start date and end date cannot be empty');
        }

        const validatedStartDate = validateDate(startDate);
        const validatedEndDate = validateDate(endDate);
        validatedEndDate.setHours(23, 59, 59, 999);

        console.log('Parsed dates:', { validatedStartDate, validatedEndDate });

        const orders = await queryOrders(validatedStartDate, validatedEndDate);
        console.log(`Found ${orders.length} orders`);

        const totalSales = orders.reduce((total, order) => total + (order.totalprice || 0), 0);

        await downloadReport(req, res, validatedStartDate, validatedEndDate, totalSales.toFixed(2), downloadformat);
    } catch (error) {
        sendErrorResponse(res, 400, `Error generating sales report: ${error.message}`);
    }
};

module.exports = {
    downloadReport,
    downloadSalesReport
};
