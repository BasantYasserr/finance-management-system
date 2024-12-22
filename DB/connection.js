import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to db ")
  } catch (error) {
    console.log("Dsadssda");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;