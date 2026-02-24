import SaleHistory from '../models/saleHistory.model';
import { CreateSaleInput, ISaleHistory, SaleQuery } from '../types';
import AppError from '../utils/AppError';

const todayMidnight = (): Date => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

const currentTime = (): string => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const createSale = async (
    input: CreateSaleInput,
    soldBy: string
): Promise<ISaleHistory> => {
    // Compute line totals and grand total
    const items = input.items.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
    }));

    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const date = input.date ? new Date(input.date) : todayMidnight();
    const time = input.time ?? currentTime();

    const sale = await SaleHistory.create({
        items,
        total,
        payment: input.payment,
        date,
        time,
        soldBy,
    });

    return sale;
};

export interface PaginatedSales {
    sales: ISaleHistory[];
    total: number;
    page: number;
    totalPages: number;
}

export const getAllSales = async (query: SaleQuery): Promise<PaginatedSales> => {
    const { page = 1, limit = 10, payment, from, to, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: Record<string, unknown> = {};

    if (payment) filter.payment = payment;

    if (from || to) {
        const dateFilter: Record<string, Date> = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) {
            const toDate = new Date(to);
            toDate.setUTCHours(23, 59, 59, 999);
            dateFilter.$lte = toDate;
        }
        filter.date = dateFilter;
    }

    if (search) {
        filter.transactionId = { $regex: search, $options: 'i' };
    }

    const [sales, total] = await Promise.all([
        SaleHistory.find(filter)
            .populate('soldBy', 'fullName email')
            .sort({ date: -1, time: -1 })
            .skip(skip)
            .limit(Number(limit)),
        SaleHistory.countDocuments(filter),
    ]);

    return {
        sales: sales as unknown as ISaleHistory[],
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
    };
};



export const getSaleById = async (id: string): Promise<ISaleHistory> => {
    const sale = await SaleHistory.findById(id).populate('soldBy', 'fullName email');
    if (!sale) throw new AppError('Sale record not found.', 404);
    return sale;
};

export const getSaleByTransactionId = async (transactionId: string): Promise<ISaleHistory> => {
    const sale = await SaleHistory.findOne({ transactionId: transactionId.toUpperCase() }).populate(
        'soldBy',
        'fullName email'
    );
    if (!sale) throw new AppError(`No sale found with transaction ID '${transactionId}'.`, 404);
    return sale;
};
