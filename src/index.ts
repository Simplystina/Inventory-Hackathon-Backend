import 'dotenv/config';
import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
        console.log(`Auth API: http://localhost:${PORT}/api/auth`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
