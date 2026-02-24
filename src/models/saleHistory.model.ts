import mongoose from 'mongoose';
import { ISaleHistory } from '../types';

const saleItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        unitPrice: {
            type: Number,
            required: true,
            min: [0, 'Unit price cannot be negative'],
        },
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Total price cannot be negative'],
        },
    },
    { _id: false }
);

const saleHistorySchema = new mongoose.Schema<ISaleHistory>(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Transaction date is required'],
        },
        time: {
            type: String,
            required: [true, 'Transaction time is required'],
            match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'],
        },
        items: {
            type: [saleItemSchema],
            required: true,
            validate: {
                validator: (v: unknown[]) => v.length > 0,
                message: 'A sale must contain at least one item',
            },
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative'],
        },
        payment: {
            type: String,
            enum: ['cash', 'card', 'transfer', 'other'],
            required: [true, 'Payment method is required'],
        },
        soldBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Auto-generate transactionId before saving
saleHistorySchema.pre<ISaleHistory & mongoose.Document>('validate', function () {
    if (!this.transactionId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.transactionId = `TXN-${timestamp}-${random}`;
    }
});

saleHistorySchema.index({ date: -1 });
saleHistorySchema.index({ transactionId: 1 });

const SaleHistory = mongoose.model<ISaleHistory>('SaleHistory', saleHistorySchema);

export default SaleHistory;
