import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    registerUser,
    loginUser,
    refreshUserTokens,
    getUserProfile,
    logoutUser,
} from '../services/auth.services';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await registerUser(req.body);
    res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await loginUser(req.body);
    res.status(200).json({ success: true, message: 'Login successful.', data: result });
});

/**
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await refreshUserTokens(req.body.refreshToken);
    res.status(200).json({ success: true, message: 'Token refreshed.', data: tokens });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await getUserProfile(req.user!.userId);
    res.status(200).json({ success: true, data: profile });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    await logoutUser(req.user!.userId);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
});
