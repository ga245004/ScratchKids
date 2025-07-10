import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { playClick, playSuccess, playError } from '../utils/soundEffects';

const Header = ({ currentView, onViewChange }) => {
  const { user, logout, isAuthenticated, isGuest, upgradeToRegistered } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogout = () => {
    playClick();
    logout();
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setError('');

    const result = await upgradeToRegistered(upgradeData.email, upgradeData.password);
    
    if (result.success) {
      playSuccess();
      setShowUpgradeModal(false);
    } else {
      playError();
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
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
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                <Button
                  variant={currentView === 'projects' ? 'secondary' : 'ghost'}
                  onClick={() => {
                    playClick();
                    onViewChange('projects');
                  }}
                  className="text-white hover:bg-white/20"
                >
                  My Projects
                </Button>
                <Button
                  variant={currentView === 'explore' ? 'secondary' : 'ghost'}
                  onClick={() => {
                    playClick();
                    onViewChange('explore');
                  }}
                  className="text-white hover:bg-white/20"
                >
                  Explore
                </Button>
                <Button
                  variant={currentView === 'progress' ? 'secondary' : 'ghost'}
                  onClick={() => {
                    playClick();
                    onViewChange('progress');
                  }}
                  className="text-white hover:bg-white/20"
                >
                  Progress
                </Button>
              </nav>
            )}

            {/* User Profile */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {isGuest && (
                  <Button
                    onClick={() => {
                      playClick();
                      setShowUpgradeModal(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold"
                  >
                    ⭐ Save Forever
                  </Button>
                )}
                
                <div className="hidden sm:block text-right">
                  <p className="font-semibold">
                    {user.username} {isGuest && '(Guest)'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {user.level}
                    </Badge>
                    <span className="text-xs opacity-90">
                      {user.completed_projects}/{user.total_projects} Projects
                    </span>
                  </div>
                </div>
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarFallback className="text-2xl bg-white text-purple-600">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/20"
                >
                  {isGuest ? 'Exit' : 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm opacity-90">Welcome to ScratchKids!</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Save Your Progress Forever! ⭐
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Create an account to save your projects and progress forever!
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  🎯 Keep all your projects<br/>
                  🏆 Save your badges<br/>
                  📊 Track your progress<br/>
                  🌟 Access from any device
                </p>
              </div>
            </div>
            
            <form onSubmit={handleUpgrade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upgrade-email">Email Address</Label>
                <Input
                  id="upgrade-email"
                  type="email"
                  placeholder="your@email.com"
                  value={upgradeData.email}
                  onChange={(e) => setUpgradeData({ ...upgradeData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upgrade-password">Create Password</Label>
                <Input
                  id="upgrade-password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={upgradeData.password}
                  onChange={(e) => setUpgradeData({ ...upgradeData, password: e.target.value })}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;