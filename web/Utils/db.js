import mongoose from "mongoose";

const dbCon = "mongodb://127.0.0.1:27017/EZdelivery";

const connectDB = async () => {
  try {
    await mongoose.connect(dbCon, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
