import { Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
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
    //console.log(req.user);
    const userId = req?.user?.userId as string
    const result = await getAllProducts(req.query, userId);
    res.status(200).json({ success: true, data: result });
});

/**
 * GET /api/products/:id
 * Public — returns a single product.
 */
export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {userId} = req.user as {userId: string}
    const product = await getProductById(id as string, userId);
    res.status(200).json({ success: true, data: product });
});

/**
 * PUT /api/products/:id
 * Protected — update an existing product (partial update supported).
 */
export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {userId} = req.user as {userId:string}
    const product = await updateProduct(id as string, req.body, userId);
    res.status(200).json({ success: true, message: 'Product updated successfully.', data: product });
});

/**
 * DELETE /api/products/:id
 * Protected — permanently delete a product.
 */
export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {userId} = req.user as {userId:string}
    await deleteProduct(id as string, userId);
    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
});
