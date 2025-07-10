from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    avatar: str = "🦸‍♂️"
    level: str = "Beginner"
    total_projects: int = 0
    completed_projects: int = 0
    badges: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    avatar: Optional[str] = "🦸‍♂️"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    avatar: str
    level: str
    total_projects: int
    completed_projects: int
    badges: List[str]
    created_at: datetime

class ProjectTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    difficulty: str  # Beginner, Intermediate, Advanced
    category: str    # Animation, Game, Music, Story, Science, Art
    thumbnail: str
    estimated_time: str
    total_steps: int = 10
    steps: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectTemplateCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str
    thumbnail: str
    estimated_time: str
    steps: List[Dict[str, Any]] = []

class UserProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    template_id: str
    title: str
    description: str
    difficulty: str
    category: str
    thumbnail: str
    progress: int = 0  # 0-100
    current_step: int = 0
    is_completed: bool = False
    mode: str = "guided"  # guided or free
    project_data: Dict[str, Any] = {}  # Store actual project code/data
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProjectCreate(BaseModel):
    template_id: str
    mode: str = "guided"

class UserProjectUpdate(BaseModel):
    progress: Optional[int] = None
    current_step: Optional[int] = None
    is_completed: Optional[bool] = None
    mode: Optional[str] = None
    project_data: Optional[Dict[str, Any]] = None

class Badge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    description: str
    requirements: Dict[str, Any] = {}  # Requirements to earn this badge
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BadgeCreate(BaseModel):
    name: str
    icon: str
    description: str
    requirements: Dict[str, Any] = {}

class UserBadge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_id: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)

class ProgressUpdate(BaseModel):
    project_id: str
    step: int
    progress: int
    is_completed: bool = False
    project_data: Optional[Dict[str, Any]] = None