import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Folder, BookOpen } from 'lucide-react';
import BookViewer from './BookViewer';
import ProjectSidebar from '@/components/ProjectSidebar';
import { useAuth } from '@/contexts/AuthContext';

const EnhancedBookViewer: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative">
      {/* Project Sidebar Toggle Button - Fixed Position */}
      {isAuthenticated && (
        <Button
          variant="outline"
          size="sm"
          className="fixed top-20 left-4 z-40 shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <BookOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {sidebarOpen ? 'Close' : 'Projects'}
          </span>
        </Button>
      )}

      {/* Project Sidebar */}
      {isAuthenticated && (
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          className={sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        />
      )}

      {/* Main Content with conditional margin */}
      <div className={`transition-all duration-300 ${sidebarOpen && isAuthenticated ? 'ml-80' : 'ml-0'}`}>
        <BookViewer />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default EnhancedBookViewer;
