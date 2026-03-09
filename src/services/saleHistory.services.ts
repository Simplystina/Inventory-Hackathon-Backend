import SaleHistory from '../models/saleHistory.model';
import Product from '../models/product.model';
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
    //Validate stock availability
    for (const item of input.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new AppError(`Product with ID '${item.productId}' not found.`, 404);
        }
        if (product.quantity < item.quantity) {
            throw new AppError(
                `Insufficient stock for '${product.name}'. Available: ${product.quantity}, Requested: ${item.quantity}.`,
                400
            );
        }
    }

    //Compute line totals and grand total
    const items = input.items.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
    }));

    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const date = input.date ? new Date(input.date) : todayMidnight();
    const time = input.time ?? currentTime();

    //Decrement inventory for each sold item
    await Product.bulkWrite(
        input.items.map((item) => ({
            updateOne: {
                filter: { _id: item.productId },
                update: { $inc: { quantity: -item.quantity } },
            },
        }))
    );

    //Record the sale
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

export const getAllSales = async (query: SaleQuery, userId: string): Promise<PaginatedSales> => {
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
        SaleHistory.find({...filter, soldBy: userId})
            .populate('soldBy', 'fullName email')
            .sort({ date: -1, time: -1 })
            .skip(skip)
            .limit(Number(limit)),
        SaleHistory.countDocuments({...filter, soldBy: userId}),
    ]);

    return {
        sales: sales as unknown as ISaleHistory[],
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
    };
};



export const getSaleById = async (id: string, userId: string): Promise<ISaleHistory> => {
    const sale = await SaleHistory.findOne({ _id: id, soldBy: userId }).populate('soldBy', 'fullName email');
    if (!sale) throw new AppError('Sale record not found.', 404);
    return sale;
};

export const getSaleByTransactionId = async (transactionId: string, userId: string): Promise<ISaleHistory> => {
    const sale = await SaleHistory.findOne({ transactionId: transactionId.toUpperCase(), soldBy: userId }).populate(
        'soldBy',
        'fullName email'
    );
    if (!sale) throw new AppError(`No sale found with transaction ID '${transactionId}'.`, 404);
    return sale;
};

export const updateSale = async (
    id: string,
    input: Partial<Pick<CreateSaleInput, 'items' | 'payment' | 'date' | 'time'>>,
    userId: string
): Promise<ISaleHistory> => {
    const existing = await SaleHistory.findOne({ _id: id, soldBy: userId });
    if (!existing) throw new AppError('Sale record not found.', 404);

    // If items are being updated, reconcile inventory
    if (input.items) {
        // Build maps of old and new quantities per productId
        const oldQty: Record<string, number> = {};
        for (const item of existing.items) {
            const pid = item.productId.toString();
            oldQty[pid] = (oldQty[pid] || 0) + item.quantity;
        }

        const newQty: Record<string, number> = {};
        for (const item of input.items) {
            newQty[item.productId] = (newQty[item.productId] || 0) + item.quantity;
        }

        // Collect all involved product IDs
        const allIds = Array.from(new Set([...Object.keys(oldQty), ...Object.keys(newQty)]));

        // Check stock for items whose quantity is increasing
        for (const pid of allIds) {
            const diff = (newQty[pid] || 0) - (oldQty[pid] || 0);
            if (diff > 0) {
                const product = await Product.findById(pid);
                if (!product) throw new AppError(`Product with ID '${pid}' not found.`, 404);
                if (product.quantity < diff) {
                    throw new AppError(
                        `Insufficient stock for '${product.name}'. Available: ${product.quantity}, Requested extra: ${diff}.`,
                        400
                    );
                }
            }
        }

        // Apply inventory diff with bulkWrite
        await Product.bulkWrite(
            allIds.map((pid) => ({
                updateOne: {
                    filter: { _id: pid },
                    update: { $inc: { quantity: (oldQty[pid] || 0) - (newQty[pid] || 0) } },
                },
            }))
        );

        // Recompute items with totalPrice
        input.items = input.items.map((item) => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice,
        })) as never;
    }

    const updateFields: Record<string, unknown> = {};
    if (input.items) {
        updateFields.items = input.items;
        updateFields.total = (input.items as { totalPrice: number }[]).reduce(
            (sum, i) => sum + i.totalPrice,
            0
        );
    }
    if (input.payment) updateFields.payment = input.payment;
    if (input.date) updateFields.date = new Date(input.date);
    if (input.time) updateFields.time = input.time;

    const sale = await SaleHistory.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).populate('soldBy', 'fullName email');

    return sale as unknown as ISaleHistory;
};

export const deleteSale = async (id: string) => {
    const sale = await SaleHistory.findById(id);
    if (!sale) throw new AppError('Sale record not found.', 404);

    //update inventory — restore quantities back to each product
    const bulkOps = sale.items.map((item) => ({
        updateOne: {
            filter: { _id: item.productId.toString() },
            update: { $inc: { quantity: item.quantity } },
        },
    }));

    if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
    }

    await sale.deleteOne();
};
