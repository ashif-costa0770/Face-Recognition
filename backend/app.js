import express from "express";
import cors from "cors";
import morgan from "morgan";
import personRoutes from "./routes/personRoutes.js";
import recognitionRoutes from "./routes/recognitionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/persons", personRoutes);
app.use("/api/recognition", recognitionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
