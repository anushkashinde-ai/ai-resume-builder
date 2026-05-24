import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ResumePreview from "../components/ResumePreview";
import { ArrowLeftIcon } from "lucide-react";
import api from "../configs/api";

const Preview = () => {
  const { resumeId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  const normalizeResume = (r) => {
    if (!r) return null;
    try {
      return {
        _id: r._id || "",
        title: r.title || "",
        personal_info: {
          image: r.personalInfo?.image || r.personal_info?.image || "",
          full_name: r.personalInfo?.fullName || r.personal_info?.full_name || r.fullName || r.full_name || "",
          profession: r.personalInfo?.profession || r.personal_info?.profession || r.profession || "",
          email: r.personalInfo?.email || r.personal_info?.email || r.email || "",
          phone: r.personalInfo?.phone || r.personal_info?.phone || r.phone || "",
          location: r.personalInfo?.location || r.personal_info?.location || r.location || "",
          linkedin: r.personalInfo?.linkedin || r.personal_info?.linkedin || r.linkedin || "",
          website: r.personalInfo?.website || r.personal_info?.website || r.website || "",
        },
        professional_summary: r.professionalSummary || r.professional_summary || "",
        experience: (r.experience || []).map((e) => ({
          company: e.company || "",
          position: e.position || "",
          start_date: e.startDate || e.start_date || "",
          end_date: e.endDate || e.end_date || "",
          description: e.description || "",
          is_current:
            typeof e.isCurrent === "boolean"
              ? e.isCurrent
              : e.is_current ?? false,
        })),
        education: (r.education || []).map((ed) => ({
          institution: ed.institution || "",
          degree: ed.degree || "",
          field: ed.field || "",
          graduation_date: ed.graduationDate || ed.graduation_date || "",
          gpa: ed.gpa || "",
        })),
        project: (r.projects || r.project || []).map((p) => ({
          name: p.name || "",
          type: p.type || p.tech || "",
          description: p.description || "",
        })),
        skills: r.skills || [],
        template: r.template || "classic",
        accent_color: r.accentColor || r.accent_color || "#3B82F6",
        public:
          typeof r.isPublic === "boolean" ? r.isPublic : r.public ?? false,
      };
    } catch (err) {
      console.error("NORMALIZATION ERROR:", err);
      return null;
    }
  };

  const loadResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/public/${resumeId}`);
      if (data.resume) {
        const normalized = normalizeResume(data.resume);
        setResumeData(normalized);
      }
    } catch (error) {
      console.error("Error loading resume:", error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading resume...</p>
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 px-4">
        <p className="text-center text-4xl sm:text-6xl text-slate-400 font-medium">
          Resume not found
        </p>
        <p className="mt-4 text-slate-500 text-center">
          The resume might be private or the ID is incorrect.
        </p>

        <Link
          to="/"
          className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2"
        >
          <ArrowLeftIcon className="size-4" />
          Go to home page
        </Link>
      </div>
    );
  }

  /* ---------------- PREVIEW ---------------- */
  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white shadow-xl">
          <ResumePreview
            data={resumeData}
            template={resumeData.template}
            accentColor={resumeData.accent_color}
          />
        </div>
      </div>
    </div>
  );
};

export default Preview;