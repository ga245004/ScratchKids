// Guest data manager for handling local storage of guest user projects and progress
class GuestDataManager {
  constructor() {
    this.projectsKey = 'guestProjects';
    this.userKey = 'guestUser';
  }

  // Get guest projects from localStorage
  getProjects() {
    try {
      const projects = localStorage.getItem(this.projectsKey);
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error('Error getting guest projects:', error);
      return [];
    }
  }

  // Save guest projects to localStorage
  saveProjects(projects) {
    try {
      localStorage.setItem(this.projectsKey, JSON.stringify(projects));
      return true;
    } catch (error) {
      console.error('Error saving guest projects:', error);
      return false;
    }
  }

  // Create a new project for guest user
  createProject(template) {
    const projects = this.getProjects();
    const newProject = {
      id: 'guest-project-' + Date.now(),
      user_id: 'guest',
      template_id: template.id,
      title: template.title,
      description: template.description,
      difficulty: template.difficulty,
      category: template.category,
      thumbnail: template.thumbnail,
      progress: 0,
      current_step: 0,
      is_completed: false,
      mode: 'guided',
      project_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  // Update project progress
  updateProject(projectId, updateData) {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      this.saveProjects(projects);
      return projects[projectIndex];
    }
    
    return null;
  }

  // Get a specific project
  getProject(projectId) {
    const projects = this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  // Delete a project
  deleteProject(projectId) {
    const projects = this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    this.saveProjects(filteredProjects);
    return true;
  }

  // Update guest user stats
  updateUserStats() {
    const projects = this.getProjects();
    const completedProjects = projects.filter(p => p.is_completed).length;
    
    const guestUser = JSON.parse(localStorage.getItem(this.userKey) || '{}');
    if (guestUser.id) {
      guestUser.total_projects = projects.length;
      guestUser.completed_projects = completedProjects;
      localStorage.setItem(this.userKey, JSON.stringify(guestUser));
    }
    
    return guestUser;
  }

  // Clear all guest data
  clearAllData() {
    localStorage.removeItem(this.projectsKey);
    localStorage.removeItem(this.userKey);
  }

  // Get project categories with counts
  getProjectCategories() {
    const projects = this.getProjects();
    const categories = {};
    
    projects.forEach(project => {
      const category = project.category.toLowerCase();
      if (!categories[category]) {
        categories[category] = { total: 0, completed: 0 };
      }
      categories[category].total++;
      if (project.is_completed) {
        categories[category].completed++;
      }
    });
    
    return categories;
  }

  // Check for badge achievements
  checkBadgeEligibility() {
    const projects = this.getProjects();
    const completedProjects = projects.filter(p => p.is_completed);
    const categories = this.getProjectCategories();
    
    const badges = [];
    
    // First project badge
    if (completedProjects.length >= 1) {
      badges.push({
        id: 'first-project',
        name: 'First Project',
        icon: '🏆',
        description: 'Complete your first project'
      });
    }
    
    // Animation master badge
    if (categories.animation && categories.animation.completed >= 3) {
      badges.push({
        id: 'animation-master',
        name: 'Animation Master',
        icon: '🎬',
        description: 'Complete 3 animation projects'
      });
    }
    
    // Game developer badge
    if (categories.game && categories.game.completed >= 3) {
      badges.push({
        id: 'game-dev',
        name: 'Game Developer',
        icon: '🎮',
        description: 'Complete 3 game projects'
      });
    }
    
    // Creative coder badge
    if (completedProjects.length >= 5) {
      badges.push({
        id: 'creative-coder',
        name: 'Creative Coder',
        icon: '✨',
        description: 'Complete 5 different projects'
      });
    }
    
    return badges;
  }
}

// Create and export a singleton instance
export const guestDataManager = new GuestDataManager();

// Export convenience functions
export const getGuestProjects = () => guestDataManager.getProjects();
export const createGuestProject = (template) => guestDataManager.createProject(template);
export const updateGuestProject = (projectId, updateData) => guestDataManager.updateProject(projectId, updateData);
export const getGuestProject = (projectId) => guestDataManager.getProject(projectId);
export const updateGuestUserStats = () => guestDataManager.updateUserStats();
export const getGuestBadges = () => guestDataManager.checkBadgeEligibility();