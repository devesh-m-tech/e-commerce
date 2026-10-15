import mongoose from "mongoose";
import { Order } from "../models/order.js";
import productModel from "../models/Product.js";
import { User } from "../models/User.js";
import Exchange from "../models/Exchange.js";

export const getIncomeStats = async (req, res) => {
    try {
        // Create new Date object for calculations
        const now = new Date();
        
        // Fix date calculations to use local time
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        // Debug log the date ranges
        // console.log('Date ranges:', {
        //     now: now.toLocaleString(),
        //     startOfDay: startOfDay.toLocaleString(),
        //     startOfWeek: startOfWeek.toLocaleString(),
        //     startOfMonth: startOfMonth.toLocaleString(),
        //     startOfYear: startOfYear.toLocaleString()
        // });

        // Fetch orders with more inclusive criteria
        const orders = await Order.find({
            $or: [
                { orderStatus: 'CONFIRMED' },
                { orderStatus: 'DELIVERED' },
                { orderStatus: 'SHIPPED' },
                { orderStatus: 'DISPATCHED' }
            ],
            $or: [
                { paymentStatus: 'COMPLETED' },
                { paymentStatus: 'PAID' }
            ]
        }).sort({ createdAt: -1 });

        // Debug log the orders
        // console.log('Found orders:', orders.length);
        // if (orders.length > 0) {
        //     console.log('Sample order:', {
        //         id: orders[0]._id,
        //         status: orders[0].orderStatus,
        //         payment: orders[0].paymentStatus,
        //         amount: orders[0].finalAmount,
        //         shipping: orders[0].shippingCharges,
        //         created: new Date(orders[0].createdAt).toLocaleString()
        //     });
        // }

        const calculateStats = (orders, startDate) => {
            const filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate;
            });

            // Debug log filtered orders
            // console.log(`Orders after ${startDate.toLocaleString()}:`, filteredOrders.length);
            if (filteredOrders.length > 0) {
                const sampleOrder = filteredOrders[0];
                const total = Number(sampleOrder.finalAmount || 0);
                const shipping = Number(sampleOrder.shippingCharges || 0);
                const orderAmount = total - shipping;
                
                // console.log('Sample filtered order:', {
                //     id: sampleOrder._id,
                //     total: (Math.floor(total * 100) / 100).toFixed(2),
                //     orderAmount: (Math.floor(orderAmount * 100) / 100).toFixed(2),
                //     shipping: (Math.floor(shipping * 100) / 100).toFixed(2),
                //     created: new Date(sampleOrder.createdAt).toLocaleString()
                // });
            }

            // Calculate totals
            let totalAmount = 0;
            let totalShipping = 0;

            filteredOrders.forEach(order => {
                totalAmount += Number(order.finalAmount || 0);
                totalShipping += Number(order.shippingCharges || 0);
            });

            const orderAmount = totalAmount - totalShipping;

            return {
                total: totalAmount,
                orderAmount: orderAmount,
                shipping: totalShipping
            };
        };

        const dayStats = calculateStats(orders, startOfDay);
        const weekStats = calculateStats(orders, startOfWeek);
        const monthStats = calculateStats(orders, startOfMonth);
        const yearStats = calculateStats(orders, startOfYear);

        const formatAmount = (amount) => {
            // Truncate to 2 decimal places without rounding
            return (Math.floor(Number(amount || 0) * 100) / 100).toFixed(2);
        };

        const incomeStats = {
            day: formatAmount(dayStats.orderAmount),
            dayShipping: formatAmount(dayStats.shipping),
            dayTotal: formatAmount(dayStats.total),
            week: formatAmount(weekStats.orderAmount),
            weekShipping: formatAmount(weekStats.shipping),
            weekTotal: formatAmount(weekStats.total),
            month: formatAmount(monthStats.orderAmount),
            monthShipping: formatAmount(monthStats.shipping),
            monthTotal: formatAmount(monthStats.total),
            year: formatAmount(yearStats.orderAmount),
            yearShipping: formatAmount(yearStats.shipping),
            yearTotal: formatAmount(yearStats.total)
        };

        // Debug log final stats
        // console.log('Final income stats:', {
        //     day: {
        //         total: formatAmount(dayStats.total),
        //         orderAmount: formatAmount(dayStats.orderAmount),
        //         shipping: formatAmount(dayStats.shipping)
        //     },
        //     week: {
        //         total: formatAmount(weekStats.total),
        //         orderAmount: formatAmount(weekStats.orderAmount),
        //         shipping: formatAmount(weekStats.shipping)
        //     },
        //     month: {
        //         total: formatAmount(monthStats.total),
        //         orderAmount: formatAmount(monthStats.orderAmount),
        //         shipping: formatAmount(monthStats.shipping)
        //     },
        //     year: {
        //         total: formatAmount(yearStats.total),
        //         orderAmount: formatAmount(yearStats.orderAmount),
        //         shipping: formatAmount(yearStats.shipping)
        //     }
        // });

        res.status(200).json({
            success: true,
            incomeStats
        });
    } catch (error) {
        console.error('Error fetching income stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching income stats'
        });
    }
};

export const getSalesTrend = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // Default to monthly if not specified

        // Create date ranges based on period
        const now = new Date();
        let startDate, groupBy;

        switch (period) {
            case 'day':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                startDate.setDate(startDate.getDate() - 7); // Last 7 days
                groupBy = { $hour: '$createdAt' };
                break;
            case 'week':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                startDate.setDate(startDate.getDate() - 30); // Last 30 days
                groupBy = { $dayOfMonth: '$createdAt' };
                break;
            case 'month':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                startDate.setMonth(startDate.getMonth() - 12); // Last 12 months
                groupBy = { $month: '$createdAt' };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid period specified'
                });
        }

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    $or: [
                        { orderStatus: 'CONFIRMED' },
                        { orderStatus: 'DELIVERED' },
                        { orderStatus: 'SHIPPED' },
                        { orderStatus: 'DISPATCHED' }
                    ],
                    $or: [
                        { paymentStatus: 'COMPLETED' },
                        { paymentStatus: 'PAID' }
                    ]
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: '$finalAmount' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$finalAmount' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Format the response based on period
        const formattedData = salesTrend.map(item => ({
            period: period === 'day' ? `${item._id}:00` : 
                    period === 'week' ? `Day ${item._id}` : 
                    `Month ${item._id}`,
            totalSales: Number(item.totalSales.toFixed(2)),
            orderCount: item.orderCount,
            averageOrderValue: Number(item.averageOrderValue.toFixed(2))
        }));

        res.status(200).json({
            success: true,
            period,
            data: formattedData
        });
    } catch (error) {
        console.error('Error fetching sales trend:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales trend'
        });
    }
};

// Summary of total orders, today's orders & sales, customers, products, pending orders, pending exchange requests, and low-stock products (Requirement 2.A)
export const getAdminDashboardSummary = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            todayOrdersCount,
            todayOrdersList,
            totalCustomers,
            totalProducts,
            pendingOrders,
            pendingExchanges,
            lowStockProducts,
            recentOrders,
            recentExchanges
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: startOfDay } }),
            Order.find({
                createdAt: { $gte: startOfDay },
                $or: [{ paymentStatus: 'COMPLETED' }, { paymentStatus: 'PAID' }]
            }),
            User.countDocuments(),
            productModel.countDocuments(),
            Order.countDocuments({ orderStatus: { $in: ['ORDER PLACED', 'PENDING'] } }),
            Exchange.countDocuments({ status: 'PENDING' }),
            productModel.find({
                $expr: {
                    $lte: ['$pStock', { $ifNull: ['$lowStockThreshold', 10] }]
                }
            }).select('pName pSku pStock lowStockThreshold pImage pPrice').sort({ pStock: 1 }).limit(10),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
            Exchange.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(5)
        ]);

        const todaySales = todayOrdersList.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

        res.status(200).json({
            success: true,
            summary: {
                totalOrders,
                todayOrders: todayOrdersCount,
                todaySales: Number(todaySales.toFixed(2)),
                totalCustomers,
                totalProducts,
                pendingOrders,
                pendingExchanges,
                lowStockCount: lowStockProducts.length,
                lowStockProducts,
                recentOrders,
                recentExchanges
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard summary' });
    }
};

// Comprehensive Reports (Requirement 2.G: Daily, weekly, monthly, yearly sales, product-wise sales, stock, payment methods, order and exchange reports)
export const getComprehensiveReports = async (req, res) => {
    try {
        const { range = 'month', startDate: customStart, endDate: customEnd } = req.query;

        const now = new Date();
        let startDate;
        let endDate = customEnd ? new Date(customEnd) : new Date();

        if (customStart) {
            startDate = new Date(customStart);
        } else if (range === 'today') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'week') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (range === 'year') {
            startDate = new Date();
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Default month
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            startDate.setHours(0, 0, 0, 0);
        }

        const dateQuery = { createdAt: { $gte: startDate, $lte: endDate } };

        // 1. Fetch matching orders
        const orders = await Order.find(dateQuery).populate('user', 'name email mobile');

        let totalRevenue = 0;
        let totalShipping = 0;
        let totalDiscount = 0;
        const paymentMethodCounts = {};
        const orderStatusCounts = {};
        const productSalesMap = {};

        orders.forEach(order => {
            if (['CONFIRMED', 'DELIVERED', 'SHIPPED', 'DISPATCHED'].includes(order.orderStatus)) {
                totalRevenue += Number(order.finalAmount) || 0;
                totalShipping += Number(order.shippingCharges) || 0;
                totalDiscount += Number(order.discount) || 0;
            }

            // Payment method stats
            const method = order.paymentMethod || 'UNKNOWN';
            if (!paymentMethodCounts[method]) {
                paymentMethodCounts[method] = { count: 0, amount: 0 };
            }
            paymentMethodCounts[method].count += 1;
            paymentMethodCounts[method].amount += Number(order.finalAmount) || 0;

            // Order status stats
            const status = order.orderStatus || 'ORDER PLACED';
            orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;

            // Product sales stats
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const pId = item.product?._id ? item.product._id.toString() : item.product?.toString() || 'unknown';
                    const name = item.product?.pName || item.name || 'Product';
                    if (!productSalesMap[pId]) {
                        productSalesMap[pId] = {
                            id: pId,
                            name,
                            quantity: 0,
                            revenue: 0,
                        };
                    }
                    productSalesMap[pId].quantity += Number(item.quantity) || 1;
                    productSalesMap[pId].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
                });
            }
        });

        // 2. Fetch Low Stock Report
        const lowStockProducts = await productModel.find({
            $expr: {
                $lte: ['$pStock', { $ifNull: ['$lowStockThreshold', 10] }]
            }
        }).select('pName pSku pStock lowStockThreshold pPrice pCategory');

        // 3. Fetch Exchange Report
        const exchanges = await Exchange.find(dateQuery);
        const exchangeStats = {
            total: exchanges.length,
            pending: exchanges.filter(e => e.status === 'PENDING').length,
            approved: exchanges.filter(e => e.status === 'APPROVED').length,
            rejected: exchanges.filter(e => e.status === 'REJECTED').length,
            completed: exchanges.filter(e => e.status === 'COMPLETED').length,
            reasons: {}
        };
        exchanges.forEach(e => {
            const r = e.reason || 'Other';
            exchangeStats.reasons[r] = (exchangeStats.reasons[r] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            dateRange: { start: startDate, end: endDate, range },
            salesSummary: {
                totalOrders: orders.length,
                totalRevenue: Number(totalRevenue.toFixed(2)),
                totalShipping: Number(totalShipping.toFixed(2)),
                totalDiscount: Number(totalDiscount.toFixed(2)),
                averageOrderValue: orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0
            },
            paymentMethods: Object.entries(paymentMethodCounts).map(([method, data]) => ({
                method,
                count: data.count,
                amount: Number(data.amount.toFixed(2))
            })),
            orderStatuses: Object.entries(orderStatusCounts).map(([status, count]) => ({
                status,
                count
            })),
            productSales: Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity),
            lowStockReport: lowStockProducts.map(p => ({
                id: p._id,
                name: p.pName,
                sku: p.pSku || 'N/A',
                stock: p.pStock,
                threshold: p.lowStockThreshold || 10,
                category: p.pCategory,
                price: p.pPrice,
                status: p.pStock <= 0 ? 'Out of Stock' : 'Low Stock'
            })),
            exchangeReport: {
                ...exchangeStats,
                reasonsList: Object.entries(exchangeStats.reasons).map(([reason, count]) => ({ reason, count }))
            }
        });
    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ success: false, message: 'Error generating reports' });
    }
};


