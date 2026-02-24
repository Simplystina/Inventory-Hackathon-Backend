import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI as string;

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`MongoDB connection error: ${error.message}`);
        }
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
});

export default connectDB;
