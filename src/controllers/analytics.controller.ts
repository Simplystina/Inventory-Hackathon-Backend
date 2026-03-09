import { Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import { getAnalytics } from '../services/analytics.services';
import { analyticsQuerySchema } from '../validations/analytics.validation';

/**
 * GET /api/analytics?period=today|week|month|year
 * Protected — returns revenue, orders, items sold, and total stock with % change.
 */
export const analytics = asyncHandler(async (req: AuthRequest, res: Response) => {
     const {userId} = req.user as {userId: string}
    const data = await getAnalytics(req.query.period as 'today' | 'week' | 'month' | 'year', userId);
    res.status(200).json({ success: true, data });
});

