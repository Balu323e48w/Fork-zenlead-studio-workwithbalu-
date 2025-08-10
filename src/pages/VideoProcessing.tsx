import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ModelModal } from "@/components/ModelModal";
import { 
  Wand2, 
  LucideIcon, 
  Sparkles, 
  Play, 
  Clock, 
  Star, 
  TrendingUp, 
  Video, 
  Zap,
  Menu,
  Plus,
  History,
  Search,
  ArrowRight,
  Download,
  Copy,
  Edit,
  CheckCircle2,
  Loader2,
  Film,
  Camera,
  Clapperboard,
  Settings,
  Palette,
  Volume2,
  FileVideo,
  MonitorPlay
} from "lucide-react";
import VideoGeneration from "@/components/video-processing/video-generation";

export interface VideoProcessingState {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

interface VideoProcessingModel {
  key: string;
  title: string;
  titletagline: string;
  description: string;
  modelName: string;
  modelkeywords: string[];
  liveornot: boolean;
  totalruns: number;
  sucessrate: number;
  processingspeed: string;
  outputquality: string;
  compatibility: string[];
  image: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  badge: string;
  features: string[];
  maxDuration: string;
  resolutions: string[];
}

const videoProcessingModels: VideoProcessingModel[] = [
  {
    key: "video-generation",
    title: "AI Video Creator",
    titletagline: "Create cinematic videos from text",
    description: "Generate stunning animated videos from simple text descriptions using state-of-the-art AI technology. Perfect for content creators, marketers, and storytellers who want to bring their ideas to life.",
    modelName: "VideoGenix Pro",
    modelkeywords: ["Video Generation", "AI Animation", "Text-to-Video", "Content Creation"],
    liveornot: false,
    totalruns: 2847,
    sucessrate: 95,
    processingspeed: "Fast",
    outputquality: "4K",
    compatibility: ["MP4", "AVI", "MOV", "WebM"],
    image: "https://www.shutterstock.com/image-photo/doctor-appointment-online-on-screen-260nw-2366001551.jpg",
    icon: Video,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    badge: "AI Powered",
    features: ["4K Resolution", "60fps Support", "Multiple Styles", "Scene Transitions", "Audio Sync"],
    maxDuration: "10 minutes",
    resolutions: ["720p", "1080p", "4K"]
  },
];

const examplePrompts = [
  {
    text: "A serene sunset over calm ocean waves with seagulls flying",
    category: "Nature",
    icon: "🌅",
    duration: "15s",
    style: "Cinematic"
  },
  {
    text: "A bustling city street at night with neon lights reflecting on wet pavement",
    category: "Urban",
    icon: "🌃",
    duration: "20s",
    style: "Dramatic"
  },
  {
    text: "A magical forest with glowing fireflies and ancient trees",
    category: "Fantasy",
    icon: "🧚",
    duration: "25s",
    style: "Mystical"
  },
  {
    text: "A modern office space with people collaborating on innovative projects",
    category: "Business",
    icon: "💼",
    duration: "18s",
    style: "Professional"
  },
  {
    text: "A peaceful countryside with rolling hills and wildflowers swaying in the breeze",
    category: "Nature",
    icon: "🌸",
    duration: "22s",
    style: "Peaceful"
  },
  {
    text: "An astronaut exploring a colorful alien planet with multiple moons",
    category: "Sci-Fi",
    icon: "🚀",
    duration: "30s",
    style: "Futuristic"
  }
];

interface VideoProject {
  id: string;
  title: string;
  prompt: string;
  timestamp: string;
  status: 'draft' | 'completed' | 'processing';
  duration: string;
  resolution: string;
  style: string;
  thumbnail: string;
  views: number;
}

const mockProjects: VideoProject[] = [
  {
    id: '1',
    title: 'Ocean Sunset Masterpiece',
    prompt: 'A serene sunset over calm ocean waves with seagulls flying',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    duration: '0:15',
    resolution: '4K',
    style: 'Cinematic',
    thumbnail: '🌅',
    views: 1247
  },
  {
    id: '2',
    title: 'Neon City Nights',
    prompt: 'A bustling city street at night with neon lights',
    timestamp: '2024-01-14T14:20:00Z',
    status: 'completed',
    duration: '0:20',
    resolution: '1080p',
    style: 'Dramatic',
    thumbnail: '🌃',
    views: 892
  },
  {
    id: '3',
    title: 'Magical Forest Journey',
    prompt: 'A magical forest with glowing fireflies and ancient trees',
    timestamp: '2024-01-13T09:15:00Z',
    status: 'processing',
    duration: '0:25',
    resolution: '4K',
    style: 'Mystical',
    thumbnail: '🧚',
    views: 0
  },
  {
    id: '4',
    title: 'Space Explorer',
    prompt: 'An astronaut exploring a colorful alien planet',
    timestamp: '2024-01-12T16:30:00Z',
    status: 'completed',
    duration: '0:30',
    resolution: '4K',
    style: 'Futuristic',
    thumbnail: '🚀',
    views: 2156
  }
];

const VideoProcessing = () => {
  // Video generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Project history state
  const [projects, setProjects] = useState<VideoProject[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState("");

  // Advanced settings
  const [videoSettings, setVideoSettings] = useState({
    resolution: "4K",
    duration: "15",
    style: "Cinematic",
    aspectRatio: "16:9"
  });

  const state: VideoProcessingState = {
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
  };

  const lockedTabs = {
    "video-generation": true,
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setSelectedPrompt(selectedPrompt);
    setActiveTab("video-generation");
    setIsModalOpen(true);
  };

  const handleTryNow = (tabKey: string) => {
    setActiveTab(tabKey);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTab(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderModelContent = () => {
    if (!activeTab) return null;
    switch (activeTab) {
      case "video-generation":
        return <VideoGeneration state={state} isLocked={lockedTabs["video-generation"]} />;
      default:
        return null;
    }
  };

  const activeModel = activeTab ? videoProcessingModels.find(m => m.key === activeTab) : null;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Project History Sidebar Component
  const ProjectHistorySidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 lg:p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-primary/80">
            <Film className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-base lg:text-lg">AI Studio</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">Video Processing</p>
          </div>
        </div>
        
        <Button className="w-full gap-2 text-sm" onClick={() => {setActiveTab(null); onClose?.();}}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 lg:p-4 border-b space-y-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Project History */}
      <div className="flex-1 min-h-0">
        <div className="p-3 lg:p-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Recent Projects</h3>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-280px)] px-3 lg:px-4">
          <div className="space-y-3 pb-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onClose?.()}
              >
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white flex-shrink-0">
                      <Video className="h-3 w-3 lg:h-4 lg:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs lg:text-sm truncate mb-1">{project.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.prompt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Video
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.duration}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{formatTimestamp(project.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="text-center py-8">
                <Video className="h-8 w-8 lg:h-12 lg:w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No projects found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Desktop Sidebar */}
        <div className="w-80 border-r bg-card/30 backdrop-blur-sm hidden lg:block h-full overflow-hidden">
          <ProjectHistorySidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-full sm:w-80 p-0 h-full overflow-hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Project History</SheetTitle>
            </SheetHeader>
            <ProjectHistorySidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden border-b bg-card/50 backdrop-blur-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">AI Studio</h1>
                <p className="text-xs text-muted-foreground">Video Processing</p>
              </div>
            </div>
            <Button
              onClick={() => setActiveTab(null)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <main className="container mx-auto px-4 py-6 lg:py-8">
              {/* Header */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Video Generation Studio
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Create stunning animated videos from text descriptions using cutting-edge AI technology. 
                  Transform your ideas into visual stories in minutes.
                </p>
              </div>


              {/* Enhanced Model Card */}
              <div className="mb-8 lg:mb-12">
                {videoProcessingModels.map((model) => (
                  <Card 
                    key={model.key}
                    className="group cursor-pointer bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200/50 hover:border-purple-400/70 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
                    onClick={() => handleTryNow(model.key)}
                  >
                    <CardContent className="p-6 lg:p-8">
                      <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${model.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <model.icon className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-2xl lg:text-3xl">{model.title}</h3>
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                  {model.badge}
                                </Badge>
                              </div>
                              <p className="text-lg text-purple-600 dark:text-purple-400 font-medium mb-3">{model.titletagline}</p>
                              <p className="text-muted-foreground leading-relaxed">{model.description}</p>
                            </div>
                          </div>

                          {/* Features Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {model.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/50">
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Action Button */}
                          <Button 
                            size="lg" 
                            className="w-full lg:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
                          >
                            <Play className="mr-2 h-5 w-5" />
                            Start Creating Videos
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>

                        {/* Right Column - Stats & Settings */}
                        <div className="space-y-6">
                          {/* Performance Stats */}
                          <Card className="bg-white/70 dark:bg-gray-800/70 border border-purple-200/50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                Performance
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                                  <p className="text-xl font-bold text-green-500">{model.sucessrate}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Total Runs</p>
                                  <p className="text-xl font-bold text-blue-500">{model.totalruns.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Speed</p>
                                  <p className="text-lg font-semibold text-orange-500">{model.processingspeed}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Quality</p>
                                  <p className="text-lg font-semibold text-purple-500">{model.outputquality}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Video Settings */}
                          <Card className="bg-white/70 dark:bg-gray-800/70 border border-purple-200/50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Settings className="h-5 w-5 text-purple-500" />
                                Quick Settings
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                                  <div className="flex gap-1">
                                    {model.resolutions.map((res) => (
                                      <Badge key={res} variant="outline" className="text-xs">
                                        {res}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Max Duration</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {model.maxDuration}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Formats</p>
                                  <div className="flex flex-wrap gap-1">
                                    {model.compatibility.map((format) => (
                                      <Badge key={format} variant="outline" className="text-xs">
                                        {format}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Example Prompts Section */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ✨ Try These Example Prompts
                    </h2>
                  </div>
                  <p className="text-muted-foreground">Get inspired with these ready-to-use video prompts</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examplePrompts.map((prompt, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 border-2 border-purple-200/50 hover:border-purple-400/70 group ${
                        selectedPrompt === prompt.text ? 'ring-2 ring-purple-500 border-purple-500' : ''
                      }`}
                      onClick={() => handlePromptSelect(prompt.text)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Prompt Header */}
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{prompt.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                                  {prompt.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {prompt.duration}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {prompt.style}
                                </Badge>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground">{prompt.text}</p>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full group-hover:bg-purple-500 group-hover:text-white transition-all duration-200 text-purple-600 hover:text-white"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Use This Prompt →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/30 shadow-xl">
                  <CardContent className="py-12 px-8">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Ready to Create Amazing Videos?
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Transform your ideas into stunning animated videos with our AI-powered video generation technology. 
                        Perfect for content creators, marketers, and storytellers.
                      </p>
                      <Button 
                        size="lg" 
                        className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                        onClick={() => handleTryNow("video-generation")}
                      >
                        <Play className="mr-3 h-6 w-6" />
                        Start Creating Videos
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <ModelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        model={activeModel}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      >
        {renderModelContent()}
      </ModelModal>
    </div>
  );
};

export default VideoProcessing;
