import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

const ProjectCard = ({ project, onStartProject, onContinueProject }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'animation':
        return 'bg-purple-100 text-purple-800';
      case 'game':
        return 'bg-blue-100 text-blue-800';
      case 'music':
        return 'bg-pink-100 text-pink-800';
      case 'story':
        return 'bg-indigo-100 text-indigo-800';
      case 'science':
        return 'bg-teal-100 text-teal-800';
      case 'art':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-2 border-gray-200 hover:border-purple-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {project.thumbnail}
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getDifficultyColor(project.difficulty)}>
              {project.difficulty}
            </Badge>
            <Badge className={getCategoryColor(project.category)}>
              {project.category}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">
          {project.description}
        </p>
        
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>⏱️ {project.estimatedTime}</span>
          <span>•</span>
          <span>📚 {project.totalSteps} steps</span>
        </div>

        {project.progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-purple-600">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
            <p className="text-xs text-gray-500">
              Step {project.currentStep} of {project.totalSteps}
            </p>
          </div>
        )}

        <div className="pt-2">
          {project.isCompleted ? (
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onStartProject(project)}
            >
              ✅ Completed - View Project
            </Button>
          ) : project.progress > 0 ? (
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => onContinueProject(project)}
            >
              Continue Building
            </Button>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => onStartProject(project)}
            >
              Start Project
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;