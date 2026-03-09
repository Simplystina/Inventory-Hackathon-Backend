import { Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    createSale,
    getAllSales,
    getSaleById,
    getSaleByTransactionId,
    updateSale,
    deleteSale,
} from '../services/saleHistory.services';

/**
 * POST /api/sales
 * Protected — record a new sale.
 */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sale = await createSale(req.body, req.user!.userId);
    res.status(201).json({ success: true, message: 'Sale recorded successfully.', data: sale });
});

/**
 * GET /api/sales
 * Protected — returns paginated sales history.
 */
export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
     const {userId} = req.user as {userId: string}
    const result = await getAllSales(req.query, userId);
    res.status(200).json({ success: true, data: result });
});

/**
 * GET /api/sales/:id
 * Protected — returns a single sale by MongoDB ID.
 */
export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const {userId} = req.user as {userId: string}
    const sale = await getSaleById(id, userId);
    res.status(200).json({ success: true, data: sale });
});

/**
 * GET /api/sales/transaction/:txnId
 * Protected — returns a single sale by transaction ID.
 */
export const getByTransactionId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const txnId = req.params.txnId as string;
     const {userId} = req.user as {userId: string}
    const sale = await getSaleByTransactionId(txnId, userId);
    res.status(200).json({ success: true, data: sale });
});

/**
 * PUT /api/sales/:id
 * Protected — update an existing sale record (items, payment, date, time).
 */
export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
     const {userId} = req.user as {userId: string}
    const sale = await updateSale(id as string, req.body, userId);
    res.status(200).json({ success: true, message: 'Sale updated successfully.', data: sale });
});

/**
 * DELETE /api/sales/:id
 * Protected — delete a sale record and restore inventory.
 */
export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
     const {userId} = req.user as {userId: string}
    await deleteSale(id as string);
    res.status(200).json({ success: true, message: 'Sale deleted successfully.' });
});
