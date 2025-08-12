import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";

import { AIStudioBase } from "@/components/ai-studio/AIStudioBase";
import { ModelSelectionInterface } from "@/components/ai-studio/ModelSelectionInterface";
import { ModelPage } from "@/components/ai-studio/ModelPage";
import { ModelModal } from "@/components/ModelModal";
import { useAIModels } from "@/hooks/useAIModels";

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

const AudioProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch audio models from API
  const { 
    models: traditionalModels, 
    contentPresets: audioContentPresets, 
    projects, 
    loading, 
    error 
  } = useAIModels('audio');

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

  // Create filter types from available models
  const filterTypes = traditionalModels.map(model => ({
    value: model.key,
    label: model.title.replace('Audio ', '').replace(' Audio', '')
  }));

  const lockedTabs = traditionalModels.reduce((acc, model) => {
    acc[model.key] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const handleNewProject = () => {
    navigate('/audio');
  };

  const handleItemSelect = (item: any, type: 'traditional' | 'content-generation') => {
    if (type === 'traditional') {
      const model = item;
      navigate(`/audio${model.path}`);
    } else {
      const preset = item;
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
      case "audio-translation":
      case "translate":
        return <AudioTranslate state={state} isLocked={lockedTabs[modelKey] || lockedTabs["translate"]} />;
      case "voice-cloning":
      case "clone":
        return <VoiceClone state={state} isLocked={lockedTabs[modelKey] || lockedTabs["clone"]} />;
      case "audio-enhancement":
      case "enhance":
        return <AudioEnhance state={state} isLocked={lockedTabs[modelKey] || lockedTabs["enhance"]} />;
      default:
        return null;
    }
  };

  // Get current model based on path
  const getCurrentModel = (path: string) => {
    const cleanPath = path.replace('/audio/', '').replace('/audio', '');
    return traditionalModels.find(model => 
      model.path.includes(cleanPath) || 
      model.key === cleanPath ||
      model.key.replace('-', '_') === cleanPath
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audio models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading audio models: {error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIStudioBase
      title="AI Audio Processing Studio"
      subtitle="Audio Processing"
      icon={Volume2}
      projects={projects}
      traditionalModels={traditionalModels}
      contentPresets={audioContentPresets}
      activeItem={null}
      activeType={null}
      onItemSelect={handleItemSelect}
      onNewProject={handleNewProject}
      filterTypes={filterTypes}
      category="audio"
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
        
        {/* Dynamic routes for traditional models */}
        {traditionalModels.map((model) => (
          <Route 
            key={model.key}
            path={model.path} 
            element={
              <ModelPage 
                model={model}
                backPath="/audio"
              >
                {renderModelContent(model.key)}
              </ModelPage>
            } 
          />
        ))}

        {/* Legacy routes for backward compatibility */}
        <Route 
          path="/translate" 
          element={
            <ModelPage 
              model={traditionalModels.find(m => m.key.includes("translation")) || traditionalModels[0]}
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
              model={traditionalModels.find(m => m.key.includes("cloning")) || traditionalModels[0]}
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
              model={traditionalModels.find(m => m.key.includes("enhancement")) || traditionalModels[0]}
              backPath="/audio"
            >
              {renderModelContent("enhance")}
            </ModelPage>
          } 
        />
      </Routes>

      {/* Enhanced Modal for Traditional Tools */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        model={getCurrentModel(location.pathname) as any}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      >
        {renderModelContent(getCurrentModel(location.pathname)?.key || "")}
      </ModelModal>
    </AIStudioBase>
  );
};

export default AudioProcessing;
