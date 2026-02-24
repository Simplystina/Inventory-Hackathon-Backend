import { Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    createProduct,
    getAllProducts,
    getProductById,
} from '../services/product.services';

/**
 * POST /api/products
 * Protected — any authenticated user can create a product.
 */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await createProduct(req.body, req.user!.userId);
    res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
});

/**
 * GET /api/products
 * Public — returns paginated list of products.
 */
export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await getAllProducts(req.query as never);
    res.status(200).json({ success: true, data: result });
});

/**
 * GET /api/products/:id
 * Public — returns a single product.
 */
export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const product = await getProductById(id as string);
    res.status(200).json({ success: true, data: product });
});
