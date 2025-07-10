import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { mockUser } from '../mock/mockData';

const Header = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold bg-white text-purple-600 rounded-full w-12 h-12 flex items-center justify-center">
              🎨
            </div>
            <div>
              <h1 className="text-2xl font-bold">ScratchKids</h1>
              <p className="text-sm opacity-90">Code, Create, Play!</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Button
              variant={currentView === 'projects' ? 'secondary' : 'ghost'}
              onClick={() => onViewChange('projects')}
              className="text-white hover:bg-white/20"
            >
              My Projects
            </Button>
            <Button
              variant={currentView === 'explore' ? 'secondary' : 'ghost'}
              onClick={() => onViewChange('explore')}
              className="text-white hover:bg-white/20"
            >
              Explore
            </Button>
            <Button
              variant={currentView === 'progress' ? 'secondary' : 'ghost'}
              onClick={() => onViewChange('progress')}
              className="text-white hover:bg-white/20"
            >
              Progress
            </Button>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="font-semibold">{mockUser.username}</p>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {mockUser.level}
                </Badge>
                <span className="text-xs opacity-90">
                  {mockUser.completedProjects}/{mockUser.totalProjects} Projects
                </span>
              </div>
            </div>
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarFallback className="text-2xl bg-white text-purple-600">
                {mockUser.avatar}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;