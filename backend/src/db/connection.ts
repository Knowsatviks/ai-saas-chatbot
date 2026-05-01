import {connect, disconnect} from 'mongoose';

async function connectToDatabase() {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
        throw new Error("MONGODB_URL environment variable is not defined");
    }
    
    try {
        await connect(mongoUrl);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

async function disconnectFromDatabase() {
    try {
        await disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
        throw new Error("Failed to disconnect from MongoDB");
    }
}

export { connectToDatabase, disconnectFromDatabase };