import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  createResume,
  deleteResume,
  getPublicResumeById,
  getResumeById,
  updateResume,
  getAllResumes,
} from "../controllers/resumeController.js";
import upload from "../configs/multer.js";

const resumeRouter = express.Router();

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes of logged-in user
 * @access  Private
 */
resumeRouter.get("/", protect, getAllResumes);

/**
 * @route   POST /api/resumes/create
 * @desc    Create new resume
 * @access  Private
 */
resumeRouter.post("/create", protect, createResume);

/**
 * @route   PUT /api/resumes/update
 * @desc    Update resume (with optional image upload)
 * @access  Private
 */
resumeRouter.put(
  "/update",
  protect,
  upload.single("image"),
  updateResume
);

/**
 * @route   DELETE /api/resumes/delete/:resumeId
 * @desc    Delete resume
 * @access  Private
 */
resumeRouter.delete("/delete/:resumeId", protect, deleteResume);

/**
 * @route   GET /api/resumes/get/:resumeId
 * @desc    Get single resume (owner)
 * @access  Private
 */
resumeRouter.get("/get/:resumeId", protect, getResumeById);

/**
 * @route   GET /api/resumes/public/:resumeId
 * @desc    Get public resume (share link)
 * @access  Public
 */
resumeRouter.get("/public/:resumeId", getPublicResumeById);

export default resumeRouter;