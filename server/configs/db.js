import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let mongodbURI = process.env.MONGODB_URI;

    if (!mongodbURI) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    await mongoose.connect(mongodbURI, {
      dbName: "resume-builder",
      family: 4, // Use IPv4, skip trying IPv6
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    
  }
};

export default connectDB;
