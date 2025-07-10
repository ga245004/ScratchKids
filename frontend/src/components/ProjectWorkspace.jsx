import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { mockProjectSteps } from '../mock/mockData';

const ProjectWorkspace = ({ project, onBack, onSaveProgress }) => {
  const [currentMode, setCurrentMode] = useState('guided');
  const [currentStep, setCurrentStep] = useState(project.currentStep || 1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const projectSteps = mockProjectSteps[project.id] || [];
  const currentStepData = projectSteps[currentStep - 1];

  const handleStepComplete = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (currentStep < projectSteps.length) {
      setCurrentStep(currentStep + 1);
    }
    // Mock saving progress
    onSaveProgress(project.id, currentStep + 1);
  };

  const handleStepSelect = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                ← Back to Projects
              </Button>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{project.thumbnail}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{project.difficulty}</Badge>
              <Badge variant="outline">{project.category}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Steps or Tools */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Project Mode
                  <Tabs value={currentMode} onValueChange={setCurrentMode}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="guided">Guided</TabsTrigger>
                      <TabsTrigger value="free">Free</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentMode === 'guided' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-semibold">
                          {Math.round((currentStep / projectSteps.length) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(currentStep / projectSteps.length) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        Step {currentStep} of {projectSteps.length}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800">Project Steps</h3>
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {projectSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              currentStep === index + 1
                                ? 'border-purple-500 bg-purple-50'
                                : step.isCompleted || completedSteps.has(step.id)
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleStepSelect(index + 1)}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                step.isCompleted || completedSteps.has(step.id)
                                  ? 'bg-green-500 text-white'
                                  : currentStep === index + 1
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {step.isCompleted || completedSteps.has(step.id) ? '✓' : index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{step.title}</p>
                                <p className="text-xs text-gray-600">{step.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Build Freely!</h3>
                    <p className="text-sm text-gray-600">
                      Use your creativity to build whatever you want. No rules, just fun!
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Quick Tools:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Add Sprite</Button>
                        <Button variant="outline" size="sm">Add Sound</Button>
                        <Button variant="outline" size="sm">Add Background</Button>
                        <Button variant="outline" size="sm">Add Motion</Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {currentMode === 'guided' ? (
                    <>
                      <span>Step {currentStep}: {currentStepData?.title}</span>
                      <Button
                        onClick={() => handleStepComplete(currentStepData?.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={!currentStepData || currentStep > projectSteps.length}
                      >
                        ✓ Complete Step
                      </Button>
                    </>
                  ) : (
                    <>
                      <span>Free Building Mode</span>
                      <Button
                        onClick={() => onSaveProgress(project.id, currentStep)}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        💾 Save Project
                      </Button>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 min-h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">
                      {project.thumbnail}
                    </div>
                    {currentMode === 'guided' && currentStepData ? (
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {currentStepData.title}
                        </h3>
                        <p className="text-lg text-gray-600 max-w-md">
                          {currentStepData.description}
                        </p>
                        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600">
                            🎯 <strong>Your Mission:</strong> {currentStepData.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 This is where the actual Scratch coding interface would be!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-800">
                          Let Your Imagination Run Wild!
                        </h3>
                        <p className="text-lg text-gray-600 max-w-md">
                          Build anything you want with {project.title}
                        </p>
                        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                          <p className="text-sm text-gray-600">
                            🎨 <strong>Free Mode:</strong> No limits, just create!
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 This is where the actual Scratch coding interface would be!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkspace;