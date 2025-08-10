import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { 
  Book, 
  FileText, 
  Mail, 
  GraduationCap,
  FileCheck,
  Users,
  LucideIcon,
  Mic,
  BarChart3,
  FileDigit,
  Volume2
} from "lucide-react";

import { AIStudioBase, BaseModel, BaseContentPreset, BaseProject } from "@/components/ai-studio/AIStudioBase";
import { ModelSelectionInterface } from "@/components/ai-studio/ModelSelectionInterface";
import { ModelPage } from "@/components/ai-studio/ModelPage";
import { ModelModal } from "@/components/ModelModal";

// Import existing components
import LongBook from "@/components/text-processing/long-book";
import TextToSpeech from "@/components/text-processing/text-to-speech";
import ExcelToSpeech from "@/components/text-processing/excel-to-speech";
import Summarize from "@/components/text-processing/summarize";
import AtsScore from "@/components/text-processing/ats-score";
import ResumeAnalyser from "@/components/text-processing/resume-analyser";

// Import content generation components
import BookGeneration from "@/components/text-processing/BookGeneration";
import CourseGeneration from "@/components/text-processing/CourseGeneration";
import ResearchGeneration from "@/components/text-processing/ResearchGeneration";
import LetterGeneration from "@/components/text-processing/LetterGeneration";

// Existing state interface
export interface TextProcessingState {
  text: string;
  setText: (text: string) => void;
  excelFile: File | null;
  setExcelFile: (file: File | null) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  bookPrompt: string;
  setBookPrompt: (prompt: string) => void;
  bookContent: { heading: string; content: string }[] | null;
  setBookContent: (content: { heading: string; content: string }[] | null) => void;
  isBookLoading: boolean;
  setIsBookLoading: (isLoading: boolean) => void;
  atsFile: File | null;
  setAtsFile: (file: File | null) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  atsScore: number | null;
  setAtsScore: (score: number | null) => void;
  isAtsLoading: boolean;
  setAtsLoading: (isLoading: boolean) => void;
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  resumeJobDescription: string;
  setResumeJobDescription: (desc: string) => void;
  resumeAnalysis: { bestPractices: string[]; tailoredSuggestions: string[]; generalRecommendations: string[] } | null;
  setResumeAnalysis: (analysis: { bestPractices: string[]; tailoredSuggestions: string[]; generalRecommendations: string[] } | null) => void;
  isResumeLoading: boolean;
  setIsResumeLoading: (isLoading: boolean) => void;
}

// Traditional models with paths
const traditionalModels: BaseModel[] = [
  {
    key: "text-to-speech",
    title: "Convert texts to voice",
    titletagline: 'Natural voice synthesis',
    description: "Convert text into natural-sounding speech with customizable voices and multilingual support.",
    modelName: "VoiceCraft",
    modelkeywords: ["Text-to-Speech", "Voice Synthesis"],
    sucessrate: 94,
    processingspeed: "Fast",
    icon: Mic,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    badge: "Popular",
    category: 'traditional',
    path: "/text-to-speech"
  },
  {
    key: "excel-to-charts",
    title: "Excel to Charts",
    titletagline: "Visualize spreadsheet data",
    description: "Transform Excel or CSV data into comprehensive audio summaries and visual charts.",
    modelName: "Excelerate",
    modelkeywords: ["Excel", "CSV"],
    sucessrate: 92,
    processingspeed: "Moderate",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    badge: "Data Viz",
    category: 'traditional',
    path: "/excel-to-charts"
  },
  {
    key: "summarize",
    title: "Summarize",
    titletagline: "Intelligent text summarization",
    description: "Create concise, meaningful summaries of large text documents using advanced NLP technology.",
    modelName: "TextSummarizer",
    modelkeywords: ["Summarization", "Text Analysis"],
    sucessrate: 97,
    processingspeed: "Fast",
    icon: FileDigit,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    badge: "AI Powered",
    category: 'traditional',
    path: "/summarize"
  },
  {
    key: "ats-score",
    title: "ATS Score",
    titletagline: "Resume optimization scoring",
    description: "Evaluate resumes against job descriptions for ATS compatibility and provide detailed improvement suggestions.",
    modelName: "ResumeRater",
    modelkeywords: ["ATS", "Resume Analysis"],
    sucessrate: 96,
    processingspeed: "Fast",
    icon: FileCheck,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    badge: "Career Boost",
    category: 'traditional',
    path: "/ats-score"
  },
  {
    key: "resume-analyser",
    title: "Resume Analyser",
    titletagline: "Professional resume enhancement",
    description: "Get tailored suggestions to improve your resume with industry-specific recommendations and best practices.",
    modelName: "ResumeOptimizer",
    modelkeywords: ["Resume Enhancement", "Career"],
    sucessrate: 94,
    processingspeed: "Moderate",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    badge: "Pro Tools",
    category: 'traditional',
    path: "/resume-analyser"
  },
];

// Content generation presets with paths
const contentPresets: BaseContentPreset[] = [
  {
    id: 'book',
    title: 'Long-form Book',
    description: 'Generate comprehensive books with chapters, cover page, images, and research references',
    icon: Book,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    estimatedTime: '15-30 minutes',
    features: ['Chapter Structure', 'Cover Design', 'Image Integration', 'Bibliography', 'Table of Contents'],
    path: "/book"
  },
  {
    id: 'research',
    title: 'Research Paper',
    description: 'Create academic papers with abstract, methodology, results, citations, and appendix',
    icon: FileCheck,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    estimatedTime: '10-20 minutes',
    features: ['Abstract', 'Literature Review', 'Methodology', 'Results & Analysis', 'Citations'],
    path: "/research"
  },
  {
    id: 'course',
    title: 'Course Material',
    description: 'Develop comprehensive courses with lesson modules, diagrams, and assignments',
    icon: GraduationCap,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    estimatedTime: '20-40 minutes',
    features: ['Lesson Modules', 'Interactive Exercises', 'Diagrams', 'Assessments', 'Progress Tracking'],
    path: "/course"
  },
  {
    id: 'letter',
    title: 'Professional Letter',
    description: 'Craft formal and informal letters with custom branding and formatting',
    icon: Mail,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    estimatedTime: '2-5 minutes',
    features: ['Letterhead', 'Formal Structure', 'Custom Branding', 'Multiple Formats', 'Templates'],
    path: "/letter"
  }
];

const mockProjects: BaseProject[] = [
  {
    id: '1',
    title: 'Complete Guide to React Development',
    type: 'book',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    model: 'BookGenix Pro',
    preview: 'A comprehensive guide covering React fundamentals, advanced patterns, and best practices...',
    category: 'content-generation',
    metadata: { wordCount: 45000 }
  },
  {
    id: '2',
    title: 'Marketing Presentation Audio',
    type: 'text-to-speech',
    timestamp: '2024-01-14T14:20:00Z',
    status: 'completed',
    model: 'VoiceCraft',
    preview: 'Converted marketing presentation to natural-sounding speech in English...',
    category: 'traditional'
  },
  {
    id: '3',
    title: 'Sales Data Analysis Charts',
    type: 'excel-to-charts',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'completed',
    model: 'Excelerate',
    preview: 'Transformed Q4 sales data into comprehensive charts and audio summary...',
    category: 'traditional'
  },
  {
    id: '4',
    title: 'Backend Development Onboarding',
    type: 'course',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'processing',
    model: 'CourseBuilder',
    preview: 'Comprehensive onboarding course for new backend developers using our tech stack...',
    category: 'content-generation'
  },
  {
    id: '5',
    title: 'Research Paper Summary',
    type: 'summarize',
    timestamp: '2024-01-12T16:30:00Z',
    status: 'completed',
    model: 'TextSummarizer',
    preview: 'Summarized 50-page AI research paper into key insights and findings...',
    category: 'traditional'
  }
];

const filterTypes = [
  { value: "text-to-speech", label: "Voice" },
  { value: "excel-to-charts", label: "Charts" },
  { value: "summarize", label: "Summary" },
  { value: "ats-score", label: "ATS" },
  { value: "resume-analyser", label: "Resume" },
  { value: "book", label: "Books" },
  { value: "research", label: "Research" },
  { value: "course", label: "Courses" },
  { value: "letter", label: "Letters" },
];

const TextProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Traditional model state - persistent settings
  const [text, setText] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookPrompt, setBookPrompt] = useState("");
  const [bookContent, setBookContent] = useState<{ heading: string; content: string }[] | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(false);
  const [atsFile, setAtsFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [isAtsLoading, setAtsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeJobDescription, setResumeJobDescription] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState<{
    bestPractices: string[];
    tailoredSuggestions: string[];
    generalRecommendations: string[];
  } | null>(null);
  const [isResumeLoading, setIsResumeLoading] = useState(false);

  // Modal state for traditional models
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const state: TextProcessingState = {
    text, setText, excelFile, setExcelFile, targetLanguage, setTargetLanguage,
    selectedVoice, setSelectedVoice, isProcessing, setIsProcessing, bookPrompt, setBookPrompt,
    bookContent, setBookContent, isBookLoading, setIsBookLoading, atsFile, setAtsFile,
    jobDescription, setJobDescription, atsScore, setAtsScore, isAtsLoading, setAtsLoading,
    resumeFile, setResumeFile, resumeJobDescription, setResumeJobDescription,
    resumeAnalysis, setResumeAnalysis, isResumeLoading, setIsResumeLoading,
  };

  const lockedTabs = {
    "text-to-speech": true,
    "ats-score": true,
    "resume-analyser": true,
    "excel-to-charts": true,
    "summarize": true,
  };

  const handleNewProject = () => {
    navigate('/text');
  };

  const handleItemSelect = (item: BaseModel | BaseContentPreset, type: 'traditional' | 'content-generation') => {
    if (type === 'traditional') {
      const model = item as BaseModel;
      navigate(`/text${model.path}`);
    } else {
      const preset = item as BaseContentPreset;
      navigate(`/text${preset.path}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderModelContent = (modelKey: string) => {
    switch (modelKey) {
      case "long-book":
        return <LongBook state={state} isLocked={lockedTabs["text-to-speech"]} />;
      case "text-to-speech":
        return <TextToSpeech state={state} isLocked={lockedTabs["text-to-speech"]} />;
      case "excel-to-charts":
        return <ExcelToSpeech state={state} isLocked={lockedTabs["excel-to-charts"]} />;
      case "summarize":
        return <Summarize state={state} isLocked={lockedTabs["summarize"]} />;
      case "ats-score":
        return <AtsScore state={state} isLocked={lockedTabs["ats-score"]} />;
      case "resume-analyser":
        return <ResumeAnalyser state={state} isLocked={lockedTabs["resume-analyser"]} />;
      default:
        return null;
    }
  };

  // Get current model based on path
  const getCurrentModel = (path: string) => {
    return traditionalModels.find(model => model.path === path);
  };

  return (
    <AIStudioBase
      title="AI Text Processing Studio"
      subtitle="Text Processing"
      icon={FileText}
      projects={mockProjects}
      traditionalModels={traditionalModels}
      contentPresets={contentPresets}
      activeItem={null}
      activeType={null}
      onItemSelect={handleItemSelect}
      onNewProject={handleNewProject}
      filterTypes={filterTypes}
    >
      <Routes>
        {/* Main selection interface */}
        <Route 
          path="/" 
          element={
            <ModelSelectionInterface
              title="AI Text Processing Studio"
              subtitle="Transform your text with AI-powered tools and content generation. Choose your processing type to get started."
              traditionalModels={traditionalModels}
              contentPresets={contentPresets}
              basePath="/text"
            />
          } 
        />
        
        {/* Traditional model routes */}
        <Route 
          path="/text-to-speech" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "text-to-speech")!}
              backPath="/text"
            >
              {renderModelContent("text-to-speech")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/excel-to-charts" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "excel-to-charts")!}
              backPath="/text"
            >
              {renderModelContent("excel-to-charts")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/summarize" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "summarize")!}
              backPath="/text"
            >
              {renderModelContent("summarize")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/ats-score" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "ats-score")!}
              backPath="/text"
            >
              {renderModelContent("ats-score")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/resume-analyser" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "resume-analyser")!}
              backPath="/text"
            >
              {renderModelContent("resume-analyser")}
            </ModelPage>
          } 
        />

        {/* Content generation routes */}
        <Route 
          path="/book" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Book Generation</h2>
                <p className="text-muted-foreground">Book generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/research" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Research Paper</h2>
                <p className="text-muted-foreground">Research paper generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/course" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Course Material</h2>
                <p className="text-muted-foreground">Course material generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/letter" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Professional Letter</h2>
                <p className="text-muted-foreground">Letter generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
      </Routes>

      {/* Enhanced Modal for Traditional Tools */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        model={getCurrentModel(location.pathname.replace('/text', '')) as any}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      >
        {renderModelContent(getCurrentModel(location.pathname.replace('/text', ''))?.key || "")}
      </ModelModal>
    </AIStudioBase>
  );
};

export default TextProcessing;
