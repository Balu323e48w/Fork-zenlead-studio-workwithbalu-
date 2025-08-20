import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Plus,
  MoreVertical,
  Loader2,
  CreditCard,
  Calendar,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";
import { format } from 'date-fns';

interface ProjectData {
  usage_id: string;
  project_type: string;
  project_name: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  project_url: string;
  status_info: {
    color: string;
    icon: string;
    can_open: boolean;
    is_processing: boolean;
  };
  credits_used: number;
  has_results: boolean;
  genre?: string;
}

interface SidebarData {
  projects: ProjectData[];
  projects_by_type: Record<string, ProjectData[]>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  summary: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
    by_type: Record<string, number>;
  };
}

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ isOpen, onClose, className = "" }) => {
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-refresh interval with processing projects polling
  useEffect(() => {
    const interval = setInterval(async () => {
      // Check if there are processing projects for faster updates
      if (sidebarData?.summary.processing > 0) {
        try {
          const processingResult = await apiService.getProcessingProjects();
          if (processingResult.success && processingResult.data.processing_projects.length > 0) {
            // Update only processing projects for efficiency
            fetchSidebarData();
          }
        } catch (error) {
          console.warn('Failed to check processing projects:', error);
        }
      } else {
        // Regular refresh
        fetchSidebarData();
      }
    }, 5000); // Check every 5 seconds for processing projects

    return () => clearInterval(interval);
  }, [sidebarData?.summary.processing]);

  const fetchSidebarData = async () => {
    try {
      setRefreshing(true);

      // Use the new backend endpoint for all AI projects
      const result = await apiService.getAllProjects({ limit: 50 });

      if (result.success) {
        setSidebarData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch projects');
      }
    } catch (error: any) {
      console.error('Sidebar fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSidebarData();
    }
  }, [isOpen]);

  const handleProjectClick = (project: ProjectData) => {
    // Use the backend-provided project_url for navigation
    if (project.status_info.can_open) {
      // For long-form books, navigate to the specific book project page
      if (project.project_type === 'long-form-book') {
        navigate(`/texts/long-form-book/${project.usage_id}`);
      } else {
        // For other project types, navigate using the project_url
        navigate(project.project_url);
      }
    } else {
      toast({
        title: "Project Not Ready",
        description: "Generation is not ready yet. Please wait.",
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = async (project: ProjectData, action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      switch (action) {
        case 'cancel':
          if (project.project_type === 'long-form-book') {
            const result = await apiService.cancelBookGeneration(project.usage_id);
            if (result.success) {
              toast({
                title: "Cancelled",
                description: `${project.title} has been cancelled`,
              });
              fetchSidebarData();
            }
          }
          break;
          
        case 'view':
          handleProjectClick(project);
          break;
          
        case 'download_pdf':
          if (project.project_type === 'long-form-book') {
            try {
              const result = await apiService.getBookPDF(project.usage_id);
              if (result.success && result.data.pdf_base64) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${result.data.pdf_base64}`;
                link.download = result.data.filename || `${project.title}.pdf`;
                link.click();

                toast({
                  title: "Downloaded",
                  description: "PDF downloaded successfully!",
                });
              }
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to download PDF",
                variant: "destructive"
              });
            }
          }
          break;

        case 'duplicate':
          if (project.project_type === 'long-form-book') {
            try {
              const result = await apiService.duplicateBookSettings(project.usage_id);
              if (result.success) {
                // Navigate to book generation with the settings
                navigate('/text-processing', {
                  state: {
                    activeModel: 'long-form-book',
                    templateSettings: result.data.settings,
                    autoStart: false
                  }
                });
                toast({
                  title: "Settings Loaded",
                  description: "Book settings loaded for duplication.",
                });
              }
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to load settings for duplication",
                variant: "destructive"
              });
            }
          }
          break;
          
        default:
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error", 
        description: `Failed to ${action}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (project: ProjectData) => {
    const { status_info } = project;
    
    if (status_info.is_processing) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (project.status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Book className="h-4 w-4 text-gray-500" />;
    }
  };

  const ProjectCard: React.FC<{ project: ProjectData }> = ({ project }) => {
    const quickActions = [];
    
    if (project.status === 'completed') {
      quickActions.push('view');
      if (project.project_type === 'long-form-book') {
        quickActions.push('download_pdf', 'duplicate');
      }
    } else if (project.status === 'processing') {
      quickActions.push('view');
      if (project.project_type === 'long-form-book') {
        quickActions.push('cancel');
      }
    } else if (project.status_info.can_open) {
      quickActions.push('view');
    }

    return (
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all mb-3 border-l-4 ${
          project.status_info.can_open ? 'border-l-primary/20 hover:border-l-primary/50' : 'border-l-gray-200 cursor-not-allowed'
        }`}
        onClick={() => project.status_info.can_open && handleProjectClick(project)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{project.thumbnail}</span>
                  {getStatusIcon(project)}
                  <h3 className="font-medium text-sm truncate">{project.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {project.subtitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(project.created_at), 'MMM dd, HH:mm')}
                </p>
              </div>
              <Badge 
                variant={project.status === 'completed' ? 'default' : 'secondary'} 
                className="text-xs"
                style={{ backgroundColor: project.status_info.color, color: 'white' }}
              >
                <span className="mr-1">{project.status_info.icon}</span>
                {project.status}
              </Badge>
            </div>

            {/* Processing indicator */}
            {project.status_info.is_processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Processing...</span>
                  <span className="text-blue-600">In Progress</span>
                </div>
                <div className="h-1 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse rounded"></div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{project.credits_used} credits</span>
              <span>{project.project_name}</span>
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="flex gap-1">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => handleQuickAction(project, action, e)}
                    title={action.replace('_', ' ')}
                  >
                    {action === 'cancel' && <AlertTriangle className="h-3 w-3" />}
                    {action === 'view' && <Eye className="h-3 w-3" />}
                    {action === 'download_pdf' && <Download className="h-3 w-3" />}
                    {action === 'duplicate' && <RefreshCw className="h-3 w-3" />}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(project);
                  }}
                  disabled={!project.status_info.can_open}
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg transform transition-transform duration-300 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">All Projects</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={fetchSidebarData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          {sidebarData && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="font-semibold">{sidebarData.summary.total}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="font-semibold">{sidebarData.summary.processing}</div>
                <div className="text-muted-foreground">Processing</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sidebarData ? (
            <div className="space-y-6">
              {/* Processing Projects */}
              {sidebarData.summary.processing > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Processing ({sidebarData.summary.processing})
                  </h3>
                  {sidebarData.projects
                    .filter(p => p.status === 'processing')
                    .map((project) => (
                      <ProjectCard key={project.usage_id} project={project} />
                    ))
                  }
                </div>
              )}

              {/* Recent Projects by Type */}
              {Object.entries(sidebarData.projects_by_type).map(([type, projects]) => (
                <div key={type}>
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({projects.length})
                  </h3>
                  {projects.slice(0, 5).map((project) => (
                    <ProjectCard key={project.usage_id} project={project} />
                  ))}
                  {projects.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      +{projects.length - 5} more projects
                    </p>
                  )}
                </div>
              ))}

              {/* Quick Actions */}
              <div className="space-y-2">
                <Separator />
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    navigate('/text-processing');
                    onClose();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Text Project
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    navigate('/book-projects');
                    onClose();
                  }}
                >
                  <Book className="h-4 w-4 mr-2" />
                  View All Projects
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Projects Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start generating your first AI project
              </p>
              <Button 
                size="sm" 
                onClick={() => {
                  navigate('/text-processing');
                  onClose();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Footer Stats */}
        {sidebarData && (
          <div className="p-4 border-t bg-muted/20">
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold">{sidebarData.summary.total}</div>
                <div>Total Projects</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{sidebarData.summary.completed}</div>
                <div>Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
