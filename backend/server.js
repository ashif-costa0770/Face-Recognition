import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import initFaceApi from "./config/faceapi.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await initFaceApi();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
