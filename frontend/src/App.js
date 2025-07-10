import React, { useState } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import ProjectWorkspace from './components/ProjectWorkspace';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { mockProjects, mockCategories, mockUser, mockBadges } from './mock/mockData';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [projects, setProjects] = useState(mockProjects);

  const handleStartProject = (project) => {
    setSelectedProject(project);
  };

  const handleContinueProject = (project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const handleSaveProgress = (projectId, step) => {
    // Mock save progress functionality
    setProjects(prev => 
      prev.map(p => 
        p.id === projectId 
          ? { ...p, currentStep: step, progress: Math.min(100, (step / p.totalSteps) * 100) }
          : p
      )
    );
    console.log(`Progress saved for project ${projectId}, step ${step}`);
  };

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category.toLowerCase() === selectedCategory);

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
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'projects' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {mockUser.username}! 🎉
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
                      <p className="text-3xl font-bold">{mockUser.completedProjects}</p>
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
                      <p className="text-3xl font-bold">{projects.filter(p => p.progress > 0 && !p.isCompleted).length}</p>
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
                      <p className="text-3xl font-bold">{mockUser.badges.length}</p>
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
                {mockCategories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onStartProject={handleStartProject}
                  onContinueProject={handleContinueProject}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === 'explore' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Explore New Projects! 🌟
              </h2>
              <p className="text-xl text-gray-600">
                Discover amazing projects created by other young coders
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.slice(0, 6).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onStartProject={handleStartProject}
                  onContinueProject={handleContinueProject}
                />
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
                      <span className="font-semibold">{mockUser.completedProjects}/{mockUser.totalProjects}</span>
                    </div>
                    <Progress value={(mockUser.completedProjects / mockUser.totalProjects) * 100} className="h-3" />
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Breakdown</h4>
                    {mockCategories.slice(1).map(category => {
                      const categoryProjects = projects.filter(p => p.category.toLowerCase() === category.id);
                      const completed = categoryProjects.filter(p => p.isCompleted).length;
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </span>
                            <span>{completed}/{category.count}</span>
                          </div>
                          <Progress value={(completed / category.count) * 100} className="h-2" />
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
                    {mockBadges.map(badge => (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg border-2 text-center ${
                          mockUser.badges.includes(badge.name)
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                        {mockUser.badges.includes(badge.name) && (
                          <Badge className="mt-2 bg-yellow-400 text-yellow-800">Earned!</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;