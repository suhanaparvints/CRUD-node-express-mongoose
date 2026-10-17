import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DATABASE,
  });
 console.log("MONGODB connected Successfully",mongoose.connection.name);
}
export default connectDB