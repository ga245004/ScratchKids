import React, { useState, useEffect } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from 'axios';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import ProjectWorkspace from './components/ProjectWorkspace';
import AuthModal from './components/AuthModal';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { soundManager, playClick, playSuccess, playError, playHover, playComplete, playBadge, playStep, playSave } from './utils/soundEffects';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  const categories = [
    { id: 'all', name: 'All Projects', icon: '🎯' },
    { id: 'animation', name: 'Animation', icon: '🎬' },
    { id: 'game', name: 'Games', icon: '🎮' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'story', name: 'Stories', icon: '📚' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'art', name: 'Art', icon: '🎨' }
  ];

  // Load user data and projects
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      loadTemplates();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [projectsRes, templatesRes, badgesRes] = await Promise.all([
        axios.get(`${API}/projects`),
        axios.get(`${API}/templates`),
        axios.get(`${API}/my-badges`)
      ]);
      
      setProjects(projectsRes.data);
      setTemplates(templatesRes.data);
      setBadges(badgesRes.data);
    } catch (error) {
      console.error('Error loading user data:', error);
      playError();
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      playError();
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async (projectOrTemplate) => {
    playClick();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Check if this is an existing project or a template
      if (projectOrTemplate.user_id) {
        // Existing project
        setSelectedProject(projectOrTemplate);
      } else {
        // Template - create new project
        const response = await axios.post(`${API}/projects`, {
          template_id: projectOrTemplate.id,
          mode: 'guided'
        });
        setSelectedProject(response.data);
        await loadUserData(); // Refresh user data
      }
    } catch (error) {
      console.error('Error starting project:', error);
      playError();
    }
  };

  const handleContinueProject = (project) => {
    playClick();
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    playClick();
    setSelectedProject(null);
  };

  const handleSaveProgress = async (projectId, step, isCompleted = false) => {
    try {
      const progress = Math.min(100, (step / 10) * 100);
      const response = await axios.post(`${API}/projects/${projectId}/progress`, {
        project_id: projectId,
        step: step,
        progress: progress,
        is_completed: isCompleted
      });
      
      if (isCompleted) {
        playComplete();
      } else {
        playStep();
      }
      
      // Check for new badges
      if (response.data.new_badges && response.data.new_badges.length > 0) {
        response.data.new_badges.forEach(() => playBadge());
      }
      
      // Refresh user data
      await loadUserData();
      
      console.log(`Progress saved for project ${projectId}, step ${step}`);
    } catch (error) {
      console.error('Error saving progress:', error);
      playError();
    }
  };

  const handleViewChange = (view) => {
    playClick();
    setCurrentView(view);
  };

  const handleCategoryChange = (category) => {
    playClick();
    setSelectedCategory(category);
  };

  // Get display data based on authentication status
  const getDisplayProjects = () => {
    if (!isAuthenticated) {
      return templates.map(template => ({
        ...template,
        progress: 0,
        currentStep: 0,
        isCompleted: false
      }));
    }
    return projects;
  };

  const displayProjects = getDisplayProjects();
  const filteredProjects = selectedCategory === 'all' 
    ? displayProjects 
    : displayProjects.filter(p => p.category.toLowerCase() === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">🎨</div>
          <p className="text-xl text-gray-600">Loading your awesome projects...</p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <ProjectWorkspace
        project={selectedProject}
        onBack={handleBackToProjects}
        onSaveProgress={handleSaveProgress}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          // Landing page for non-authenticated users
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to ScratchKids! 🎉
              </h2>
              <p className="text-xl text-gray-600">
                Learn to code with fun projects and games!
              </p>
              <Button 
                onClick={() => {
                  playClick();
                  setShowAuthModal(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-4"
              >
                Start Your Coding Journey! 🚀
              </Button>
            </div>

            {/* Sample Projects */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Sample Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.slice(0, 6).map(template => (
                  <ProjectCard
                    key={template.id}
                    project={{
                      ...template,
                      progress: 0,
                      currentStep: 0,
                      isCompleted: false
                    }}
                    onStartProject={handleStartProject}
                    onContinueProject={handleContinueProject}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Authenticated user dashboard
          <>
            {currentView === 'projects' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome back, {user.username}! 🎉
                  </h2>
                  <p className="text-xl text-gray-600">
                    Ready to create something amazing today?
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Completed Projects</p>
                          <p className="text-3xl font-bold">{user.completed_projects}</p>
                        </div>
                        <div className="text-4xl">✅</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Projects in Progress</p>
                          <p className="text-3xl font-bold">{projects.filter(p => p.progress > 0 && !p.is_completed).length}</p>
                        </div>
                        <div className="text-4xl">🚀</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Badges Earned</p>
                          <p className="text-3xl font-bold">{badges.length}</p>
                        </div>
                        <div className="text-4xl">🏆</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Filter */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">Choose Your Adventure</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => {
                      const count = category.id === 'all' 
                        ? displayProjects.length 
                        : displayProjects.filter(p => p.category.toLowerCase() === category.id).length;
                      
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          onClick={() => handleCategoryChange(category.id)}
                          className="flex items-center space-x-2"
                          onMouseEnter={() => playHover()}
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      onMouseEnter={() => playHover()}
                    >
                      <ProjectCard
                        project={project}
                        onStartProject={handleStartProject}
                        onContinueProject={handleContinueProject}
                      />
                    </div>
                  ))}
                </div>

                {/* New Project from Templates */}
                {templates.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">Start New Project</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templates.filter(template => 
                        !projects.some(project => project.template_id === template.id)
                      ).map(template => (
                        <div
                          key={template.id}
                          onMouseEnter={() => playHover()}
                        >
                          <ProjectCard
                            project={{
                              ...template,
                              progress: 0,
                              currentStep: 0,
                              isCompleted: false
                            }}
                            onStartProject={handleStartProject}
                            onContinueProject={handleContinueProject}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'explore' && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Explore New Projects! 🌟
                  </h2>
                  <p className="text-xl text-gray-600">
                    Discover amazing projects and get inspired!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onMouseEnter={() => playHover()}
                    >
                      <ProjectCard
                        project={{
                          ...template,
                          progress: 0,
                          currentStep: 0,
                          isCompleted: false
                        }}
                        onStartProject={handleStartProject}
                        onContinueProject={handleContinueProject}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'progress' && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Coding Journey 📊
                  </h2>
                  <p className="text-xl text-gray-600">
                    Track your progress and celebrate your achievements!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Progress Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Projects Completed</span>
                          <span className="font-semibold">{user.completed_projects}/{user.total_projects}</span>
                        </div>
                        <Progress value={user.total_projects > 0 ? (user.completed_projects / user.total_projects) * 100 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold">Project Breakdown</h4>
                        {categories.slice(1).map(category => {
                          const categoryProjects = projects.filter(p => p.category.toLowerCase() === category.id);
                          const completed = categoryProjects.filter(p => p.is_completed).length;
                          const total = categoryProjects.length;
                          
                          if (total === 0) return null;
                          
                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </span>
                                <span>{completed}/{total}</span>
                              </div>
                              <Progress value={(completed / total) * 100} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Badges & Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {badges.map(badge => (
                          <div
                            key={badge.id}
                            className="p-4 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-center"
                          >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <h4 className="font-semibold text-sm">{badge.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                            <Badge className="mt-2 bg-yellow-400 text-yellow-800">Earned!</Badge>
                          </div>
                        ))}
                        
                        {badges.length === 0 && (
                          <div className="col-span-2 text-center py-8">
                            <div className="text-4xl mb-2">🏆</div>
                            <p className="text-gray-600">Complete your first project to earn badges!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;