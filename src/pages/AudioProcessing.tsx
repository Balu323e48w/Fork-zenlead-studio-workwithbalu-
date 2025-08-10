import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { 
  Languages, 
  Headphones, 
  Wand2, 
  LucideIcon,
  Volume2,
  Mic,
  AudioWaveform
} from "lucide-react";

import { AIStudioBase, BaseModel, BaseContentPreset, BaseProject } from "@/components/ai-studio/AIStudioBase";
import { ModelSelectionInterface } from "@/components/ai-studio/ModelSelectionInterface";
import { ModelPage } from "@/components/ai-studio/ModelPage";
import { ModelModal } from "@/components/ModelModal";

import AudioTranslate from "@/components/audio-processing/audio-translate";
import VoiceClone from "@/components/audio-processing/voice-clone";
import AudioEnhance from "@/components/audio-processing/audio-enhance";

export interface AudioProcessingState {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

// Traditional audio processing models with paths
const traditionalModels: BaseModel[] = [
  {
    key: "translate",
    title: "Audio Translation",
    titletagline: "Multilingual voice conversion",
    description: "Translate audio into 20+ languages while preserving the original voice's emotion, tone, and speaking style for authentic cross-language communication.",
    modelName: "AudioTrans",
    modelkeywords: ["Audio Translation", "Multilingual"],
    sucessrate: 97,
    processingspeed: "Fast",
    icon: Languages,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    badge: "Popular",
    category: 'traditional',
    path: "/translate"
  },
  {
    key: "clone",
    title: "Voice Cloning",
    titletagline: "AI-powered voice replication",
    description: "Create an accurate digital clone of any voice from just a few audio samples. Perfect for content creation, personalization, and accessibility.",
    modelName: "VoiceReplicator",
    modelkeywords: ["Voice Cloning", "AI Voice"],
    sucessrate: 94,
    processingspeed: "Moderate",
    icon: Headphones,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    badge: "AI Powered",
    category: 'traditional',
    path: "/clone"
  },
  {
    key: "enhance",
    title: "Audio Enhancement",
    titletagline: "Professional audio cleanup",
    description: "Transform low-quality audio into crystal-clear recordings with advanced noise reduction, echo removal, and clarity enhancement algorithms.",
    modelName: "AudioClear",
    modelkeywords: ["Audio Enhancement", "Noise Reduction"],
    sucessrate: 92,
    processingspeed: "Fast",
    icon: Wand2,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    badge: "Pro Tools",
    category: 'traditional',
    path: "/enhance"
  },
];

// Content generation presets with paths (removed for audio processing focus)
const audioContentPresets: BaseContentPreset[] = [];

const mockProjects: BaseProject[] = [
  {
    id: '1',
    title: 'French Audio Translation',
    type: 'translate',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    model: 'AudioTrans',
    preview: 'Translated product demo from English to French preserving speaker tone...',
    category: 'traditional',
    metadata: { duration: '8:30' }
  },
  {
    id: '2',
    title: 'CEO Voice Clone',
    type: 'clone',
    timestamp: '2024-01-14T14:20:00Z',
    status: 'completed',
    model: 'VoiceReplicator',
    preview: 'Created AI voice clone for automated company announcements...',
    category: 'traditional',
    metadata: { duration: '5:20' }
  },
  {
    id: '3',
    title: 'Interview Audio Enhancement',
    type: 'enhance',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'completed',
    model: 'AudioClear',
    preview: 'Enhanced remote interview recording with noise reduction and clarity...',
    category: 'traditional',
    metadata: { duration: '45:12' }
  },
  {
    id: '4',
    title: 'Spanish Voice Translation',
    type: 'translate',
    timestamp: '2024-01-12T16:30:00Z',
    status: 'processing',
    model: 'AudioTrans',
    preview: 'Converting English presentation to Spanish with original voice characteristics...',
    category: 'traditional',
    metadata: { duration: '12:15' }
  }
];

const filterTypes = [
  { value: "translate", label: "Translation" },
  { value: "clone", label: "Voice Clone" },
  { value: "enhance", label: "Enhancement" },
];

const AudioProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Traditional model state - persistent settings
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal state for traditional models
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const state: AudioProcessingState = {
    audioFile, setAudioFile, targetLanguage, setTargetLanguage,
    selectedVoice, setSelectedVoice, isProcessing, setIsProcessing,
  };

  const lockedTabs = {
    translate: true,
    clone: true,
    enhance: true,
  };

  const handleNewProject = () => {
    navigate('/audio');
  };

  const handleItemSelect = (item: BaseModel | BaseContentPreset, type: 'traditional' | 'content-generation') => {
    if (type === 'traditional') {
      const model = item as BaseModel;
      navigate(`/audio${model.path}`);
    } else {
      const preset = item as BaseContentPreset;
      navigate(`/audio${preset.path}`);
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
      case "translate":
        return <AudioTranslate state={state} isLocked={lockedTabs.translate} />;
      case "clone":
        return <VoiceClone state={state} isLocked={lockedTabs.clone} />;
      case "enhance":
        return <AudioEnhance state={state} isLocked={lockedTabs.enhance} />;
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
      title="AI Audio Processing Studio"
      subtitle="Audio Processing"
      icon={Volume2}
      projects={mockProjects}
      traditionalModels={traditionalModels}
      contentPresets={audioContentPresets}
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
              title="AI Audio Processing Studio"
              subtitle="Transform your audio with cutting-edge AI technology. Translate languages, clone voices, enhance quality, and create professional content."
              traditionalModels={traditionalModels}
              contentPresets={audioContentPresets}
              basePath="/audio"
            />
          } 
        />
        
        {/* Traditional model routes */}
        <Route 
          path="/translate" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "translate")!}
              backPath="/audio"
            >
              {renderModelContent("translate")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/clone" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "clone")!}
              backPath="/audio"
            >
              {renderModelContent("clone")}
            </ModelPage>
          } 
        />
        
        <Route 
          path="/enhance" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key === "enhance")!}
              backPath="/audio"
            >
              {renderModelContent("enhance")}
            </ModelPage>
          } 
        />

        {/* Content generation routes */}
        <Route 
          path="/podcast" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Podcast Generation</h2>
                <p className="text-muted-foreground">Podcast generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/music" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Music Generation</h2>
                <p className="text-muted-foreground">Music generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/voiceover" 
          element={
            <div className="flex-1 p-4 lg:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Voiceover Generation</h2>
                <p className="text-muted-foreground">Voiceover generation interface coming soon...</p>
              </div>
            </div>
          } 
        />
      </Routes>

      {/* Enhanced Modal for Traditional Tools */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        model={getCurrentModel(location.pathname.replace('/audio', '')) as any}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      >
        {renderModelContent(getCurrentModel(location.pathname.replace('/audio', ''))?.key || "")}
      </ModelModal>
    </AIStudioBase>
  );
};

export default AudioProcessing;
