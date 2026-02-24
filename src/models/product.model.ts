import mongoose from 'mongoose';
import { IProduct } from '../types';

const productSchema = new mongoose.Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            minlength: [2, 'Product name must be at least 2 characters'],
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
            default: '',
        },
        sku: {
            type: String,
            unique: true,
            sparse: true, // allows multiple docs with no SKU
            uppercase: true,
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        cost: {
            type: Number,
            required: [true, 'Cost is required'],
            min: [0, 'Cost cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Initial stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        lowStockAlert: {
            type: Number,
            min: [0, 'Low stock alert threshold cannot be negative'],
            default: 5,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

//productSchema.index({ name: 'text', category: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;