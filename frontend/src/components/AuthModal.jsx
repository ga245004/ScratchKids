import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { playClick, playSuccess, playError } from '../utils/soundEffects';

const AuthModal = ({ isOpen, onClose }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    avatar: '🦸‍♂️' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  
  const { login, register } = useAuth();

  const avatarOptions = ['🦸‍♂️', '🦸‍♀️', '🐱', '🐶', '🦁', '🐸', '🦋', '🚀', '🌟', '🎨'];

  const handleLogin = async (e) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setError('');

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      playSuccess();
      onClose();
    } else {
      playError();
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setError('');

    const result = await register(
      registerData.username,
      registerData.email,
      registerData.password,
      registerData.avatar
    );
    
    if (result.success) {
      playSuccess();
      setActiveTab('login');
      setError('');
      // Auto-fill login form
      setLoginData({ 
        email: registerData.email, 
        password: registerData.password 
      });
    } else {
      playError();
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    playClick();
    setActiveTab(tab);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to ScratchKids! 🎨
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Welcome Back!</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Join the Fun!</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Your cool username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Choose a strong password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Choose Your Avatar</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {avatarOptions.map((avatar) => (
                        <Button
                          key={avatar}
                          type="button"
                          variant={registerData.avatar === avatar ? "default" : "outline"}
                          className="text-2xl p-2 h-12"
                          onClick={() => {
                            playClick();
                            setRegisterData({ ...registerData, avatar });
                          }}
                        >
                          {avatar}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;