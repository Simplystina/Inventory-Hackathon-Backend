import express, { Application, Request, Response } from 'express';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import saleHistoryRoutes from './routes/saleHistory.routes';
import analyticsRoutes from './routes/analytics.routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import cors from "cors";

const app: Application = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleHistoryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(globalErrorHandler);

export default app;
