import Product from '../models/product.model';
import { CreateProductInput, ProductQuery, IProduct } from '../types';
import AppError from '../utils/AppError';


export const createProduct = async (
    input: CreateProductInput,
    createdBy: string
): Promise<IProduct> => {
    // Check for duplicate SKU if provided
    if (input.sku) {
        const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
        if (existing) throw new AppError(`Product with SKU '${input.sku.toUpperCase()}' already exists.`, 409);
    }

    const product = await Product.create({ ...input, createdBy });
    return product;
};

export interface PaginatedProducts {
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
}

export const getAllProducts = async (query: ProductQuery): Promise<PaginatedProducts> => {
    const { page = 1, limit = 10, category, search, isActive, stockStatus } = query;
    const skip = (page - 1) * limit;

    // Build dynamic filter
    const filter: Record<string, unknown> = {};

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    // if (search) filter.$text = { $search: search };
    // Text search across name, sku, and category
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ];
    }

    // Stock status filters
    if (stockStatus === 'soldOut') {
        filter.quantity = 0;
    } else if (stockStatus === 'lowStock') {
        // quantity > 0 but quantity <= lowStockAlert threshold
        filter.$expr = { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$lowStockAlert'] }] };
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(filter),
    ]);

    return {
        products: products as IProduct[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getProductById = async (id: string): Promise<IProduct> => {
    const product = await Product.findById(id).populate('createdBy', 'fullName email');
    if (!product) throw new AppError('Product not found.', 404);
    return product;
}
