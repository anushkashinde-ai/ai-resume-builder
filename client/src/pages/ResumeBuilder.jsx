import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User,
} from "lucide-react";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummary from "../components/ProfessionalSummary";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";
import Loader from "../components/Loader";


const ResumeBuilder = () => {
  const SAVING_DISABLED = false;
  const normalizeResume = (r) => {
    try {
      return {
        _id: r._id || "",
        title: r.title || "",
        personal_info: {
          image: r.personalInfo?.image ?? r.personal_info?.image ?? "",
          full_name: r.personalInfo?.fullName ?? r.personal_info?.full_name ?? "",
          profession: r.personalInfo?.profession ?? r.personal_info?.profession ?? "",
          email: r.personalInfo?.email ?? r.personal_info?.email ?? "",
          phone: r.personalInfo?.phone ?? r.personal_info?.phone ?? "",
          location: r.personalInfo?.location ?? r.personal_info?.location ?? "",
          linkedin: r.personalInfo?.linkedin ?? r.personal_info?.linkedin ?? "",
          website: r.personalInfo?.website ?? r.personal_info?.website ?? "",
        },
        professional_summary: r.professionalSummary ?? r.professional_summary ?? "",
        experience: (r.experience || []).map((e) => ({
          company: e.company || "",
          position: e.position || "",
          start_date: e.startDate ?? e.start_date ?? "",
          end_date: e.endDate ?? e.end_date ?? "",
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
          graduation_date: ed.graduationDate ?? ed.graduation_date ?? "",
          gpa: ed.gpa || "",
        })),
        project: (r.projects ?? r.project ?? []).map((p) => ({
          name: p.name || "",
          type: p.type ?? p.tech ?? "",
          description: p.description || "",
        })),
        skills: r.skills || [],
        template: r.template || "classic",
        accent_color: r.accentColor ?? r.accent_color ?? "#3B82F6",
        public:
          typeof r.isPublic === "boolean" ? r.isPublic : r.public ?? false,
      };
    } catch {
      return {
        _id: "",
        title: "",
        personal_info: {},
        professional_summary: "",
        experience: [],
        education: [],
        project: [],
        skills: [],
        template: "classic",
        accent_color: "#3B82F6",
        public: false,
      };
    }
  };
  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get("/api/resumes/get/" + resumeId, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.resume) {
        const normalized = normalizeResume(data.resume);
        setResumeData(normalized);
        document.title = normalized.title || "Resume";
      } else {
        toast.error("Resume not found");
        navigate("/app");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load resume");
      navigate("/app");
    } finally {
      setIsLoading(false);
    }
  };

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", title: "Personal Info", icon: User },
    { id: "summary", title: "Summary", icon: FileText },
    { id: "experience", title: "Experience", icon: Briefcase },
    { id: "education", title: "Education", icon: GraduationCap },
    { id: "projects", title: "Projects", icon: FolderIcon },
    { id: "skills", title: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    loadExistingResume();
  }, [resumeId, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <Loader />
      </div>
    );
  }

  if (!resumeData?._id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
        <p className="text-center text-4xl sm:text-6xl text-slate-400 font-medium">
          Resume not found
        </p>
        <Link
          to="/app"
          className="mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2 ring-1 ring-green-400 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const changeResumeVisibility = async () => {
    if (SAVING_DISABLED) return;
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append(
        "resumeData",
        JSON.stringify({ public: !resumeData.public }),
      );
      const { data } = await api.put("/api/resumes/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumeData({ ...resumeData, public: !resumeData.public });
      toast.success(data.message);
    } catch (error) {
      console.error("Error saving resume:", error);
    }
  };

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeurl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeurl, text: "My Resume" });
    } else {
      alert("Share not supported on this browser.");
    }
  };

  const downloadResume = () => {
    window.print();
  };

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);

      // remove image from updatedResumeData
      if (typeof resumeData.personal_info.image === "object") {
        delete updatedResumeData.personal_info.image;
      }

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === "object" &&
        formData.append("image", resumeData.personal_info.image);

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumeData(normalizeResume(data.resume));
      toast.success(data.message);
    } catch (error) {
      console.error("Error saving resume:", error);
    }
  };
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to={"/app"}
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel-from */}
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
              {/* progress bar using acticeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-500"
                style={{
                  width: `${(activeSectionIndex * 100) / (sections.length - 1)}%`,
                }}
              />

              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) =>
                      setResumeData((prev) => ({ ...prev, template: template }))
                    }
                  />
                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) =>
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      onClick={() =>
                        setActiveSectionIndex((prevIndex) =>
                          Math.max(prevIndex - 1, 0),
                        )
                      }
                      className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                      disabled={activeSectionIndex === 0}
                    >
                      <ChevronLeft className="size-4" /> Previous
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setActiveSectionIndex((prevIndex) =>
                        Math.min(prevIndex + 1, sections.length - 1),
                      )
                    }
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && "opacity-50 "}`}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Form content */}
              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personal_info: data,
                      }))
                    }
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                  />
                )}
                {activeSection.id === "summary" && (
                  <ProfessionalSummary
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                  />
                )}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, experience: data }))
                    }
                  />
                )}
                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, education: data }))
                    }
                  />
                )}
                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.project}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, project: data }))
                    }
                  />
                )}
                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, skills: data }))
                    }
                  />
                )}
              </div>

              <button
                onClick={() => {
                  if (SAVING_DISABLED) return;
                  toast.promise(saveResume, { loading: "Saving...", success: "Resume saved!", error: "Error saving resume" });
                }}
                disabled={SAVING_DISABLED}
                className={`bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm ${SAVING_DISABLED ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Right panel-preview */}
          <div className="lg:col-span-7 max-lg:mt-6 ">
            <div className="relative w-full">
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
                {resumeData.public && (
                  <button
                    onClick={handleShare}
                    className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors"
                  >
                    <Share2Icon className="size-4" />
                    Share
                  </button>
                )}
                <button
                  onClick={changeResumeVisibility}
                  className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors"
                >
                  {resumeData.public ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeOffIcon className="size-4" />
                  )}
                  {resumeData.public ? "Public" : "Private"}
                </button>
                <button
                  onClick={downloadResume}
                  className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors "
                >
                  <DownloadIcon className="size-4" />
                  Download
                </button>
              </div>
            </div>

            {/* resume preview */}
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
