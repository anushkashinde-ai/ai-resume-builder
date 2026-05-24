import express from "express";
import {
  loginUser,
  registerUser,
  getUserData,
} from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// auth routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// logged-in user data
router.get("/data", protect, getUserData);

export default router;