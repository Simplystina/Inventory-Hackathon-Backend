import { Request } from 'express';
import mongoose from 'mongoose';

export interface IUser {
    _id: string;
    fullName: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'staff';
    phoneNumber?: string;
    businessAddress?: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'manager' | 'staff';
    phoneNumber?: string;
    businessAddress?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: { id: unknown; name: string; email: string; role: string };
    accessToken: string;
    refreshToken: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface IProduct {
    _id: string;
    name: string;
    description?: string;
    price: number;
    cost: number;
    quantity: number;
    lowStockAlert: number;
    category: string;
    sku?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductInput {
    name: string;
    description?: string;
    price: number;
    cost: number;
    quantity?: number;
    lowStockAlert?: number;
    category: string;
    sku?: string;
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    price?: number;
    cost?: number;
    quantity?: number;
    lowStockAlert?: number;
    category?: string;
    sku?: string;
    isActive?: boolean;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
    stockStatus?: 'lowStock' | 'soldOut' | 'all';
}

//--Sales Types

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface SaleItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface ISaleHistory {
    _id: string;
    transactionId: string;
    date: Date;
    time: string;
    items: SaleItem[];
    total: number;
    payment: PaymentMethod;
    soldBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSaleInput {
    items: {
        productId: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }[];
    payment: PaymentMethod;
    date?: string;
    time?: string;
}

export interface SaleQuery {
    page?: number;
    limit?: number;
    payment?: PaymentMethod;
    from?: string;
    to?: string;
    search?: string;
}
