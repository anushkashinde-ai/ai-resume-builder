import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// GET ALL RESUMES (FIXED)
export const getAllResumes = async (req, res) => {
  try {
    const userId = req.userId;

    const resumes = await Resume.find({ userId })
      .select("title updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// CREATE RESUME
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Resume title is required",
      });
    }

    const newResume = await Resume.create({
      userId,
      title,
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// DELETE RESUME
// DELETE: /api/resumes/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const deletedResume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId,
    });

    if (!deletedResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET RESUME BY ID
// GET: /api/resumes/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    }).select("-__v");

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// GET PUBLIC RESUME
// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
    }).select("-__v");

    if (!resume) {
      return res.status(404).json({
        message: "Public resume not found",
      });
    }

    return res.status(200).json({
      resume: resume.toObject(),
    });
  } catch (error) {
    console.error("PUBLIC FETCH ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// controller for updating a resume
// pUT: /api/resumes.update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    console.log("Update resume request received:");
    console.log("- Resume ID:", resumeId);
    console.log("- Image file:", image ? image.originalname : "No image");
    console.log("- Remove background:", removeBackground);

    // First, get the existing resume to preserve the image
    const existingResume = await Resume.findOne({ userId, _id: resumeId });
    console.log("- Existing resume found:", existingResume ? existingResume._id : "Not found");
    console.log("- Existing image:", existingResume?.personalInfo?.image);

    // Parse when payload is multipart (string) or already object
    let resumeDataCopy =
      typeof resumeData === "string" ? JSON.parse(resumeData) : resumeData;

    // Transform snake_case payload to match schema camelCase
    const toCamel = (data) => {
      if (!data || typeof data !== "object") return {};
      const out = {};
      
      // Basic Info
      if (data.title !== undefined) out.title = data.title;
      if (data.public !== undefined) out.isPublic = data.public;
      if (data.isPublic !== undefined) out.isPublic = data.isPublic;
      if (data.template !== undefined) out.template = data.template;
      if (data.accent_color !== undefined) out.accentColor = data.accent_color;
      if (data.accentColor !== undefined) out.accentColor = data.accentColor;
      if (data.professional_summary !== undefined) out.professionalSummary = data.professional_summary;
      if (data.professionalSummary !== undefined) out.professionalSummary = data.professionalSummary;
      
      // Personal Info
      const p = data.personal_info || data.personalInfo;
      if (p) {
        out.personalInfo = {
          image: p.image || (existingResume?.personalInfo?.image || ""),
          fullName: p.full_name || p.fullName || "",
          profession: p.profession || "",
          email: p.email || "",
          phone: p.phone || "",
          location: p.location || "",
          linkedin: p.linkedin || "",
          website: p.website || "",
        };
      }

      // Arrays
      if (data.skills !== undefined) out.skills = Array.isArray(data.skills) ? data.skills : [];
      
      const expIn = data.experience;
      if (expIn !== undefined) {
        out.experience = Array.isArray(expIn)
          ? expIn.map((e) => ({
              company: e.company || "",
              position: e.position || "",
              startDate: e.start_date || e.startDate || "",
              endDate: e.end_date || e.endDate || "",
              description: e.description || "",
              isCurrent: typeof e.is_current === "boolean" ? e.is_current : (e.isCurrent ?? false),
            }))
          : [];
      }

      const projectsIn = data.project || data.projects;
      if (projectsIn !== undefined) {
        out.projects = Array.isArray(projectsIn)
          ? projectsIn.map((p) => ({
              name: p.name || "",
              tech: p.tech || p.type || "",
              description: p.description || "",
            }))
          : [];
      }

      const eduIn = data.education;
      if (eduIn !== undefined) {
        out.education = Array.isArray(eduIn)
          ? eduIn.map((ed) => ({
              institution: ed.institution || "",
              degree: ed.degree || "",
              field: ed.field || "",
              graduationDate: ed.graduation_date || ed.graduationDate || "",
              gpa: ed.gpa || "",
            }))
          : [];
      }

      return out;
    };

    resumeDataCopy = toCamel(resumeDataCopy);
    console.log("- Parsed resume data:", resumeDataCopy);

    if (image) {
      console.log("- Uploading image to ImageKit...");
      const imageBufferData = fs.createReadStream(image.path);

      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300, h-300, fo-face, z-0.75" +
            (removeBackground ? ", e-bgremove" : ""),
        },
      });
      console.log("- Image uploaded successfully! URL:", response.url);

      if (!resumeDataCopy.personalInfo) {
        resumeDataCopy.personalInfo = {};
      }
      resumeDataCopy.personalInfo.image = response.url;
    }

    console.log("- Final resume data to save:", resumeDataCopy);

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { returnDocument: 'after', runValidators: true },
    );

    console.log("- Resume updated successfully!");
    return res.status(200).json({ message: "Saved successfully", resume });
  } catch (error) {
    console.error("- Update resume error:", error);
    return res.status(400).json({ message: error.message });
  }
};
