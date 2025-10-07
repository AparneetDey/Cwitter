import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MONGODB SUCCESSFULLY CONNECTED :: ", connectInstance.connections[0].host);
    } catch (error) {
        console.log("MONGGODB CONNECTION ERROR :: ", error)
    }
}