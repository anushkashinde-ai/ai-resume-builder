import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    template: { type: String, default: "classic" },
    accentColor: { type: String, default: "#3B82F6" },
    professionalSummary: { type: String, default: "" },

    skills: [{ type: String }],

    personalInfo: {
      image: { type: String, default: "" },
      fullName: { type: String, default: "" },
      profession: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    experience: [
      {
        company: { type: String },
        position: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        isCurrent: { type: Boolean, default: false },
      },
    ],

    projects: [
      {
        name: { type: String },
        tech: { type: String },
        description: { type: String },
      },
    ],

    education: [
      {
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        graduationDate: { type: String },
        gpa: { type: String },
      },
    ],
  },
  { timestamps: true, minimize: false }
);

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;
