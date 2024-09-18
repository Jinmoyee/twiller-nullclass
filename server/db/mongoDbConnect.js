import mongoose from "mongoose";

const connectMongoDb = () => {
    try {
        const db = mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected")
        // console.log(process.env.MONGO_URI)
    } catch (error) {
        console.log("MongoDB connection error")
    }
}

export default connectMongoDb;