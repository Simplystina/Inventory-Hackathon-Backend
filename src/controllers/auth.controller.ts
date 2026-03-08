import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import asyncHandler from '../utils/asyncHandler';
import {
    registerUser,
    loginUser,
    refreshUserTokens,
    getUserProfile,
    updateUserProfile,
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

/**
 * PUT /api/auth/profile
 * Protected — update name, phone number, and/or business address.
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fullName, phoneNumber, businessAddress } = req.body;
    const profile = await updateUserProfile(req.user!.userId, { fullName, phoneNumber, businessAddress });
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: profile });
});
