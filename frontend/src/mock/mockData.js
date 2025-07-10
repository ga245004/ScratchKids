// Mock data for Scratch coding platform
export const mockUser = {
  id: '1',
  username: 'CodeNinja',
  email: 'codeninja@example.com',
  avatar: '🦸‍♂️',
  level: 'Beginner',
  totalProjects: 3,
  completedProjects: 1,
  badges: ['First Project', 'Animation Master']
};

export const mockProjects = [
  {
    id: '1',
    title: 'Dancing Cat',
    description: 'Make a cat dance to music with fun animations!',
    difficulty: 'Beginner',
    category: 'Animation',
    thumbnail: '🐱',
    estimatedTime: '30 min',
    progress: 100,
    isCompleted: true,
    totalSteps: 10,
    currentStep: 10
  },
  {
    id: '2',
    title: 'Space Adventure',
    description: 'Build a rocket ship game and explore the galaxy!',
    difficulty: 'Beginner',
    category: 'Game',
    thumbnail: '🚀',
    estimatedTime: '45 min',
    progress: 60,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 6
  },
  {
    id: '3',
    title: 'Magic Garden',
    description: 'Create a magical garden with growing flowers and butterflies!',
    difficulty: 'Beginner',
    category: 'Animation',
    thumbnail: '🌸',
    estimatedTime: '35 min',
    progress: 20,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 2
  },
  {
    id: '4',
    title: 'Underwater World',
    description: 'Dive into an underwater adventure with fish and treasures!',
    difficulty: 'Intermediate',
    category: 'Game',
    thumbnail: '🐠',
    estimatedTime: '50 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '5',
    title: 'Musical Band',
    description: 'Create a band of animals playing different instruments!',
    difficulty: 'Beginner',
    category: 'Music',
    thumbnail: '🎵',
    estimatedTime: '40 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '6',
    title: 'Racing Car',
    description: 'Build a fast racing car and compete on the track!',
    difficulty: 'Intermediate',
    category: 'Game',
    thumbnail: '🏎️',
    estimatedTime: '55 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '7',
    title: 'Fairy Tale Castle',
    description: 'Design a magical castle with princes and princesses!',
    difficulty: 'Beginner',
    category: 'Story',
    thumbnail: '🏰',
    estimatedTime: '45 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '8',
    title: 'Dinosaur Park',
    description: 'Create a prehistoric park with roaming dinosaurs!',
    difficulty: 'Intermediate',
    category: 'Animation',
    thumbnail: '🦕',
    estimatedTime: '60 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '9',
    title: 'Pizza Maker',
    description: 'Run your own pizza shop and serve customers!',
    difficulty: 'Beginner',
    category: 'Game',
    thumbnail: '🍕',
    estimatedTime: '40 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '10',
    title: 'Weather Station',
    description: 'Build a weather station that predicts the weather!',
    difficulty: 'Intermediate',
    category: 'Science',
    thumbnail: '🌤️',
    estimatedTime: '50 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '11',
    title: 'Superhero City',
    description: 'Create a city with superheroes saving the day!',
    difficulty: 'Advanced',
    category: 'Game',
    thumbnail: '🦸‍♀️',
    estimatedTime: '70 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  },
  {
    id: '12',
    title: 'Art Gallery',
    description: 'Design an interactive art gallery with masterpieces!',
    difficulty: 'Intermediate',
    category: 'Art',
    thumbnail: '🎨',
    estimatedTime: '55 min',
    progress: 0,
    isCompleted: false,
    totalSteps: 10,
    currentStep: 0
  }
];

export const mockProjectSteps = {
  '1': [
    { id: 1, title: 'Choose Your Cat', description: 'Select a cat sprite for your project', isCompleted: true },
    { id: 2, title: 'Add a Stage', description: 'Pick a colorful background for your cat', isCompleted: true },
    { id: 3, title: 'Make Cat Move', description: 'Use motion blocks to make your cat walk', isCompleted: true },
    { id: 4, title: 'Add Music', description: 'Choose a fun song for your cat to dance to', isCompleted: true },
    { id: 5, title: 'Dance Moves', description: 'Program different dance moves', isCompleted: true },
    { id: 6, title: 'Add Effects', description: 'Make your cat sparkle and glow', isCompleted: true },
    { id: 7, title: 'Color Changes', description: 'Change cat colors while dancing', isCompleted: true },
    { id: 8, title: 'Add Props', description: 'Give your cat a hat or bow tie', isCompleted: true },
    { id: 9, title: 'Final Performance', description: 'Put all moves together for a show', isCompleted: true },
    { id: 10, title: 'Share Your Project', description: 'Save and share your dancing cat', isCompleted: true }
  ],
  '2': [
    { id: 1, title: 'Create Your Rocket', description: 'Design a cool rocket ship sprite', isCompleted: true },
    { id: 2, title: 'Space Background', description: 'Add a starry space background', isCompleted: true },
    { id: 3, title: 'Rocket Controls', description: 'Use arrow keys to control the rocket', isCompleted: true },
    { id: 4, title: 'Add Asteroids', description: 'Create moving asteroids to avoid', isCompleted: true },
    { id: 5, title: 'Collision Detection', description: 'Program what happens when rocket hits asteroid', isCompleted: true },
    { id: 6, title: 'Fuel System', description: 'Add a fuel gauge that decreases over time', isCompleted: true },
    { id: 7, title: 'Collect Stars', description: 'Add stars to collect for points', isCompleted: false },
    { id: 8, title: 'Sound Effects', description: 'Add rocket sounds and explosion effects', isCompleted: false },
    { id: 9, title: 'Score System', description: 'Track and display the player score', isCompleted: false },
    { id: 10, title: 'Game Over Screen', description: 'Create win/lose screens with restart option', isCompleted: false }
  ]
};

export const mockCategories = [
  { id: 'all', name: 'All Projects', icon: '🎯', count: 12 },
  { id: 'animation', name: 'Animation', icon: '🎬', count: 3 },
  { id: 'game', name: 'Games', icon: '🎮', count: 4 },
  { id: 'music', name: 'Music', icon: '🎵', count: 1 },
  { id: 'story', name: 'Stories', icon: '📚', count: 1 },
  { id: 'science', name: 'Science', icon: '🔬', count: 1 },
  { id: 'art', name: 'Art', icon: '🎨', count: 1 }
];

export const mockBadges = [
  { id: 'first-project', name: 'First Project', icon: '🏆', description: 'Complete your first project' },
  { id: 'animation-master', name: 'Animation Master', icon: '🎬', description: 'Complete 3 animation projects' },
  { id: 'game-dev', name: 'Game Developer', icon: '🎮', description: 'Complete 3 game projects' },
  { id: 'creative-coder', name: 'Creative Coder', icon: '✨', description: 'Complete 5 different projects' },
  { id: 'music-maker', name: 'Music Maker', icon: '🎵', description: 'Complete a music project' },
  { id: 'story-teller', name: 'Story Teller', icon: '📖', description: 'Complete a story project' }
];