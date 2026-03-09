import SaleHistory from '../models/saleHistory.model';
import Product from '../models/product.model';

type Period = 'today' | 'week' | 'month' | 'year';

/**
 * Returns the start/end date range for the current and previous period.
 */
const getPeriodRanges = (period: Period) => {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date = new Date(now);
    let previousStart: Date;
    let previousEnd: Date;

    if (period === 'today') {
        currentStart = new Date(now);
        currentStart.setUTCHours(0, 0, 0, 0);
        currentEnd.setUTCHours(23, 59, 59, 999);

        previousStart = new Date(currentStart);
        previousStart.setUTCDate(previousStart.getUTCDate() - 1);
        previousEnd = new Date(currentStart);
        previousEnd.setUTCMilliseconds(-1);
    } else if (period === 'week') {
        const dayOfWeek = now.getUTCDay();
        currentStart = new Date(now);
        currentStart.setUTCDate(now.getUTCDate() - dayOfWeek);
        currentStart.setUTCHours(0, 0, 0, 0);

        previousStart = new Date(currentStart);
        previousStart.setUTCDate(previousStart.getUTCDate() - 7);
        previousEnd = new Date(currentStart);
        previousEnd.setUTCMilliseconds(-1);
    } else if (period === 'month') {
        currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
        previousEnd = new Date(currentStart);
        previousEnd.setUTCMilliseconds(-1);
    } else {
        // year
        currentStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        previousStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
        previousEnd = new Date(currentStart);
        previousEnd.setUTCMilliseconds(-1);
    }

    return { currentStart, currentEnd, previousStart, previousEnd: previousEnd! };
};

const pctChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

interface PeriodMetrics {
    totalRevenue: number;
    totalOrders: number;
    totalItemsSold: number;
}

const getMetricsForRange = async (start: Date, end: Date, userId:string): Promise<PeriodMetrics> => {
    const [result] = await SaleHistory.aggregate([
        { $match: { date: { $gte: start, $lte: end }, soldBy: userId } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                totalOrders: { $sum: 1 },
                totalItemsSold: { $sum: { $sum: '$items.quantity' } },
            },
        },
    ]);

    return {
        totalRevenue: result?.totalRevenue ?? 0,
        totalOrders: result?.totalOrders ?? 0,
        totalItemsSold: result?.totalItemsSold ?? 0,
    };
};

export const getAnalytics = async (period: Period = 'month', userId: string) => {
    const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodRanges(period);

    // Run all 4 queries concurrently
    const [current, previous, stockResult, paymentResult] = await Promise.all([
        getMetricsForRange(currentStart, currentEnd, userId),
        getMetricsForRange(previousStart, previousEnd, userId),
        Product.aggregate([
            { $match: { isActive: true, soldBy: userId } },
            { $group: { _id: null, totalStock: { $sum: '$quantity' } } },
        ]),
        SaleHistory.aggregate([
            { $match: { date: { $gte: currentStart, $lte: currentEnd }, payment: { $exists: true, $ne: null }, soldBy: userId } },
            { $group: { _id: '$payment', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
        ]),
    ]);

    const totalStock: number = stockResult[0]?.totalStock ?? 0;
    const topPaymentMethod: string | null = paymentResult[0]?._id ?? null;

    return {
        period,
        totalRevenue: {
            value: parseFloat(current.totalRevenue.toFixed(2)),
            change: pctChange(current.totalRevenue, previous.totalRevenue),
        },
        totalOrders: {
            value: current.totalOrders,
            change: pctChange(current.totalOrders, previous.totalOrders),
        },
        totalItemsSold: {
            value: current.totalItemsSold,
            change: pctChange(current.totalItemsSold, previous.totalItemsSold),
        },
        totalStock: {
            value: totalStock,
        },
        topPaymentMethod,
    };
};
