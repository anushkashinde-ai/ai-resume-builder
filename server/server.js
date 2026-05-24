import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

dotenv.config();

await connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "https://ai-resume-builder-psi-five.vercel.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is live...");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
