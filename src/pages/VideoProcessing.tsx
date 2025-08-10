import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { 
  Video, 
  Play, 
  Film, 
  LucideIcon,
  Clapperboard,
  Camera,
  MonitorPlay
} from "lucide-react";

import { AIStudioBase, BaseModel, BaseContentPreset, BaseProject } from "@/components/ai-studio/AIStudioBase";
import { ModelSelectionInterface } from "@/components/ai-studio/ModelSelectionInterface";
import { ModelPage } from "@/components/ai-studio/ModelPage";
import { ModelModal } from "@/components/ModelModal";

import VideoGeneration from "@/components/video-processing/video-generation";

export interface VideoProcessingState {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

// Traditional video processing models with paths
const traditionalModels: BaseModel[] = [
  {
    key: "video-generation",
    title: "AI Video Creator",
    titletagline: "Create cinematic videos from text",
    description: "Generate stunning animated videos from simple text descriptions using state-of-the-art AI technology. Perfect for content creators, marketers, and storytellers.",
    modelName: "VideoGenix Pro",
    modelkeywords: ["Video Generation", "AI Animation"],
    sucessrate: 95,
    processingspeed: "Fast",
    icon: Video,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    badge: "AI Powered",
    category: 'traditional',
    path: "/video-generation"
  },
];

// Content generation presets with paths (empty for video processing focus)
const videoContentPresets: BaseContentPreset[] = [];

const mockProjects: BaseProject[] = [
  {
    id: '1',
    title: 'Ocean Sunset Masterpiece',
    type: 'video-generation',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    model: 'VideoGenix Pro',
    preview: 'A serene sunset over calm ocean waves with seagulls flying in the distance...',
    category: 'traditional',
    metadata: { duration: '0:15' }
  },
  {
    id: '2',
    title: 'City Night Timelapse',
    type: 'video-generation',
    timestamp: '2024-01-14T14:20:00Z',
    status: 'completed',
    model: 'VideoGenix Pro',
    preview: 'Bustling city street at night with neon lights and traffic flow...',
    category: 'traditional',
    metadata: { duration: '0:20' }
  },
  {
    id: '3',
    title: 'Mountain Landscape',
    type: 'video-generation',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'processing',
    model: 'VideoGenix Pro',
    preview: 'Majestic mountain range with flowing clouds and golden hour lighting...',
    category: 'traditional',
    metadata: { duration: '0:30' }
  },
  {
    id: '4',
    title: 'Abstract Art Animation',
    type: 'video-generation',
    timestamp: '2024-01-12T16:30:00Z',
    status: 'completed',
    model: 'VideoGenix Pro',
    preview: 'Colorful abstract shapes morphing and flowing in dynamic patterns...',
    category: 'traditional',
    metadata: { duration: '0:25' }
  }
];

const filterTypes = [
  { value: "video-generation", label: "Generation" },
];

const VideoProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Traditional model state - persistent settings
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal state for traditional models
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const state: VideoProcessingState = {
    prompt, setPrompt, isGenerating, setIsGenerating,
  };

  const lockedTabs = {
    "video-generation": true,
  };

  const handleNewProject = () => {
    navigate('/video');
  };

  const handleItemSelect = (item: BaseModel | BaseContentPreset, type: 'traditional' | 'content-generation') => {
    if (type === 'traditional') {
      const model = item as BaseModel;
      navigate(`/video${model.path}`);
    } else {
      const preset = item as BaseContentPreset;
      navigate(`/video${preset.path}`);
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
      case "video-generation":
        return <VideoGeneration state={state} isLocked={lockedTabs["video-generation"]} />;
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
      title="AI Video Processing Studio"
      subtitle="Video Processing"
      icon={Video}
      projects={mockProjects}
      traditionalModels={traditionalModels}
      contentPresets={videoContentPresets}
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
              title="AI Video Processing Studio"
              subtitle="Transform your ideas into stunning animated videos with cutting-edge AI technology. Create professional content in minutes."
              traditionalModels={traditionalModels}
              contentPresets={videoContentPresets}
              basePath="/video"
            />
          } 
        />
        
        {/* Traditional model routes */}
        <Route 
          path="/video-generation" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "video-generation")!}
              backPath="/video"
            >
              {renderModelContent("video-generation")}
            </ModelPage>
          } 
        />

        {/* Content generation routes */}
        <Route 
          path="/short-video" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Short Video Generation</h2>
                <p className="text-muted-foreground">Short video generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/marketing-video" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Marketing Video</h2>
                <p className="text-muted-foreground">Marketing video generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/tutorial-video" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Tutorial Video</h2>
                <p className="text-muted-foreground">Tutorial video generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
      </Routes>

      {/* Enhanced Modal for Traditional Tools */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        model={getCurrentModel(location.pathname.replace('/video', '')) as any}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      >
        {renderModelContent(getCurrentModel(location.pathname.replace('/video', ''))?.key || "")}
      </ModelModal>
    </AIStudioBase>
  );
};

export default VideoProcessing;
