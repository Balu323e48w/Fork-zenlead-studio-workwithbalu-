import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/apiService';

interface ProcessingProject {
  usage_id: string;
  project_type: string;
  title: string;
  status: string;
  progress?: number;
  started_at: string;
}

interface UseProcessingProjectsReturn {
  processingProjects: ProcessingProject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProcessingProjects = (
  interval: number = 5000,
  enabled: boolean = true
): UseProcessingProjectsReturn => {
  const [processingProjects, setProcessingProjects] = useState<ProcessingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcessingProjects = useCallback(async () => {
    try {
      const result = await apiService.getProcessingProjects();
      if (result.success) {
        setProcessingProjects(result.data.processing_projects || []);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch processing projects');
      }
    } catch (err: any) {
      console.error('Error fetching processing projects:', err);
      setError(err.message || 'Failed to fetch processing projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchProcessingProjects();
  }, [fetchProcessingProjects]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchProcessingProjects();

    // Set up interval for real-time updates
    const intervalId = setInterval(fetchProcessingProjects, interval);

    return () => clearInterval(intervalId);
  }, [fetchProcessingProjects, interval, enabled]);

  return {
    processingProjects,
    loading,
    error,
    refetch
  };
};

// Hook for managing all projects with real-time updates
export const useAllProjects = (refreshInterval: number = 30000) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsByType, setProjectsByType] = useState<Record<string, any[]>>({});
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { processingProjects } = useProcessingProjects(5000, summary.processing > 0);

  const fetchAllProjects = useCallback(async () => {
    try {
      const result = await apiService.getAllProjects({ limit: 50 });
      if (result.success) {
        setProjects(result.data.projects || []);
        setProjectsByType(result.data.projects_by_type || {});
        setSummary(result.data.summary || {});
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      console.error('Error fetching all projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchAllProjects();
  }, [fetchAllProjects]);

  useEffect(() => {
    // Initial fetch
    fetchAllProjects();

    // Set up interval for regular updates
    const intervalId = setInterval(fetchAllProjects, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchAllProjects, refreshInterval]);

  // Update processing projects more frequently
  useEffect(() => {
    if (processingProjects.length > 0) {
      // Update the main projects list with latest processing project data
      setProjects(prevProjects =>
        prevProjects.map(project => {
          const processingUpdate = processingProjects.find(p => p.usage_id === project.usage_id);
          return processingUpdate ? { ...project, ...processingUpdate } : project;
        })
      );
    }
  }, [processingProjects]);

  return {
    projects,
    projectsByType,
    summary,
    loading,
    error,
    refetch,
    processingProjects
  };
};
