import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.DB_CONNECTION);
        console.log(`\n[MongoDB] Connected successfully! Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('[MongoDB] Connection Failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
