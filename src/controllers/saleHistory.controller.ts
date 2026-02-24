import { Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    createSale,
    getAllSales,
    getSaleById,
    getSaleByTransactionId,
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
    const result = await getAllSales(req.query as never);
    res.status(200).json({ success: true, data: result });
});

/**
 * GET /api/sales/:id
 * Protected — returns a single sale by MongoDB ID.
 */
export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const sale = await getSaleById(id);
    res.status(200).json({ success: true, data: sale });
});

/**
 * GET /api/sales/transaction/:txnId
 * Protected — returns a single sale by transaction ID.
 */
export const getByTransactionId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const txnId = req.params.txnId as string;
    const sale = await getSaleByTransactionId(txnId);
    res.status(200).json({ success: true, data: sale });
});
