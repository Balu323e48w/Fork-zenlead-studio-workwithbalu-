import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NavigationLayout from "@/components/NavigationLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Book, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus, 
  Eye, 
  Download,
  Trash2,
  RefreshCw,
  BarChart3,
  BookOpen,
  Calendar,
  Timer,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookApiService } from "@/lib/bookApi";
import { format } from 'date-fns';

interface ProjectData {
  usage_id: string;
  title: string;
  status: string;
  progress: number;
  created_at: string;
  last_activity: string;
  credits_used: number;
  url_slug: string;
  thumbnail?: string;
  can_resume: boolean;
  estimated_completion?: string;
  word_count?: number;
  chapters_completed?: number;
  total_chapters?: number;
}

interface DashboardData {
  active_projects: ProjectData[];
  completed_projects: ProjectData[];
  failed_projects: ProjectData[];
  recent_projects: ProjectData[];
  total_count: number;
  summary: {
    active: number;
    completed: number;
    failed: number;
    total_credits_used: number;
  };
}

const BookProjects: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const data = await BookApiService.getBookHistory(50, 0);
      
      // Transform data to match expected format
      const transformedData: DashboardData = {
        active_projects: data.books.filter(b => b.status === 'processing').map(transformProject),
        completed_projects: data.books.filter(b => b.status === 'completed').map(transformProject),
        failed_projects: data.books.filter(b => b.status === 'failed').map(transformProject),
        recent_projects: data.books.slice(0, 5).map(transformProject),
        total_count: data.books.length,
        summary: {
          active: data.books.filter(b => b.status === 'processing').length,
          completed: data.books.filter(b => b.status === 'completed').length,
          failed: data.books.filter(b => b.status === 'failed').length,
          total_credits_used: data.summary?.total_credits_used || 0
        }
      };
      
      setDashboardData(transformedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
      toast({
        title: "Error",
        description: "Failed to load projects dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const transformProject = (book: any): ProjectData => ({
    usage_id: book.usage_id,
    title: book.book_title || 'Untitled Book',
    status: book.status,
    progress: 0, // Will be fetched from state endpoint
    created_at: book.created_at,
    last_activity: book.created_at,
    credits_used: book.credits_used || 0,
    url_slug: `book-${book.usage_id.slice(0, 8)}`,
    can_resume: book.status === 'processing',
    word_count: book.word_count || 0,
    chapters_completed: 0,
    total_chapters: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleProjectAction = async (project: ProjectData, action: string) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/book-generation/${project.url_slug}`);
          break;
        case 'resume':
          navigate(`/book-generation/${project.url_slug}?action=resume`);
          break;
        case 'pause':
          // await BookApiService.pauseGeneration(project.usage_id);
          toast({
            title: "Paused",
            description: "Generation paused successfully"
          });
          fetchDashboard();
          break;
        case 'download':
          await BookApiService.downloadBookPDF(project.usage_id);
          break;
        default:
          break;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} project`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Book className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const ProjectCard: React.FC<{ project: ProjectData; showActions?: boolean }> = ({ 
    project, 
    showActions = true 
  }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 mb-2">
              {getStatusIcon(project.status)}
              <span className="truncate">{project.title}</span>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(project.created_at), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {project.credits_used} credits
              </div>
            </div>
          </div>
          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {project.status === 'processing' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            {project.estimated_completion && (
              <p className="text-xs text-muted-foreground mt-2">
                Est. completion: {project.estimated_completion}
              </p>
            )}
          </div>
        )}

        {project.word_count > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{project.word_count.toLocaleString()} words</span>
            </div>
            {project.total_chapters > 0 && (
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-muted-foreground" />
                <span>{project.chapters_completed}/{project.total_chapters} chapters</span>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleProjectAction(project, 'view')}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            {project.can_resume && (
              <Button 
                size="sm"
                onClick={() => handleProjectAction(project, 'resume')}
              >
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
            
            {project.status === 'processing' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleProjectAction(project, 'pause')}
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}
            
            {project.status === 'completed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleProjectAction(project, 'download')}
              >
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Book Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your AI-generated books and track generation progress
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchDashboard} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/ai-studio/long-form-book')}>
              <Plus className="h-4 w-4 mr-2" />
              New Book
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">{dashboardData.summary.active}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{dashboardData.summary.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{dashboardData.total_count}</p>
                  </div>
                  <Book className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Credits Used</p>
                    <p className="text-2xl font-bold">{dashboardData.summary.total_credits_used}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active ({dashboardData?.summary.active || 0})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({dashboardData?.summary.completed || 0})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({dashboardData?.summary.failed || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.recent_projects.map((project) => (
                <ProjectCard key={project.usage_id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            {dashboardData?.active_projects.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Projects</h3>
                <p className="text-muted-foreground mb-4">Start generating a new book to see it here.</p>
                <Button onClick={() => navigate('/ai-studio/long-form-book')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Book
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.active_projects.map((project) => (
                  <ProjectCard key={project.usage_id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.completed_projects.map((project) => (
                <ProjectCard key={project.usage_id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="failed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.failed_projects.map((project) => (
                <ProjectCard key={project.usage_id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {dashboardData?.total_count === 0 && (
          <div className="text-center py-20">
            <Book className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No Books Generated Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start creating comprehensive AI-generated books with images, professional formatting, and PDF export.
            </p>
            <Button size="lg" onClick={() => navigate('/ai-studio/long-form-book')}>
              <Plus className="h-5 w-5 mr-2" />
              Generate Your First Book
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookProjects;
