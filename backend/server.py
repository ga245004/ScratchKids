from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import timedelta

from models import (
    User, UserCreate, UserLogin, UserResponse, 
    ProjectTemplate, ProjectTemplateCreate,
    UserProject, UserProjectCreate, UserProjectUpdate,
    Badge, BadgeCreate, ProgressUpdate
)
from database import database
from auth import verify_password, get_password_hash, create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="ScratchKids API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await database.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Auth endpoints
@api_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await database.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        avatar=user_data.avatar
    )
    
    created_user = await database.create_user(user)
    return UserResponse(**created_user.dict())

@api_router.post("/login")
async def login(user_data: UserLogin):
    user = await database.get_user_by_email(user_data.email)
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.dict())
    }

@api_router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Project Template endpoints
@api_router.get("/templates", response_model=List[ProjectTemplate])
async def get_all_templates():
    return await database.get_all_templates()

@api_router.get("/templates/{template_id}", response_model=ProjectTemplate)
async def get_template(template_id: str):
    template = await database.get_template_by_id(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@api_router.post("/templates", response_model=ProjectTemplate)
async def create_template(template_data: ProjectTemplateCreate):
    template = ProjectTemplate(**template_data.dict())
    return await database.create_template(template)

# User Project endpoints
@api_router.get("/projects", response_model=List[UserProject])
async def get_user_projects(current_user: User = Depends(get_current_user)):
    return await database.get_user_projects(current_user.id)

@api_router.post("/projects", response_model=UserProject)
async def create_user_project(
    project_data: UserProjectCreate,
    current_user: User = Depends(get_current_user)
):
    # Get template
    template = await database.get_template_by_id(project_data.template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Create user project
    user_project = UserProject(
        user_id=current_user.id,
        template_id=template.id,
        title=template.title,
        description=template.description,
        difficulty=template.difficulty,
        category=template.category,
        thumbnail=template.thumbnail,
        mode=project_data.mode
    )
    
    created_project = await database.create_user_project(user_project)
    
    # Update user's total projects count
    await database.update_user(current_user.id, {
        "total_projects": current_user.total_projects + 1
    })
    
    return created_project

@api_router.get("/projects/{project_id}", response_model=UserProject)
async def get_user_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    project = await database.get_user_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return project

@api_router.put("/projects/{project_id}", response_model=UserProject)
async def update_user_project(
    project_id: str,
    update_data: UserProjectUpdate,
    current_user: User = Depends(get_current_user)
):
    project = await database.get_user_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update project
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    updated_project = await database.update_user_project(project_id, update_dict)
    
    # If project is completed, update user's completed projects count
    if update_data.is_completed and not project.is_completed:
        await database.update_user(current_user.id, {
            "completed_projects": current_user.completed_projects + 1
        })
        
        # Check for new badges
        await database.check_and_award_badges(current_user.id)
    
    return updated_project

@api_router.post("/projects/{project_id}/progress")
async def update_project_progress(
    project_id: str,
    progress_data: ProgressUpdate,
    current_user: User = Depends(get_current_user)
):
    project = await database.get_user_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update progress
    update_data = {
        "current_step": progress_data.step,
        "progress": progress_data.progress,
        "is_completed": progress_data.is_completed
    }
    
    if progress_data.project_data:
        update_data["project_data"] = progress_data.project_data
    
    updated_project = await database.update_user_project(project_id, update_data)
    
    # If project is completed, update user's completed projects count
    if progress_data.is_completed and not project.is_completed:
        await database.update_user(current_user.id, {
            "completed_projects": current_user.completed_projects + 1
        })
        
        # Check for new badges
        new_badges = await database.check_and_award_badges(current_user.id)
        
        return {
            "project": updated_project,
            "new_badges": new_badges
        }
    
    return {"project": updated_project, "new_badges": []}

@api_router.delete("/projects/{project_id}")
async def delete_user_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    project = await database.get_user_project_by_id(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    success = await database.delete_user_project(project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project"
        )
    
    # Update user's total projects count
    await database.update_user(current_user.id, {
        "total_projects": current_user.total_projects - 1
    })
    
    return {"message": "Project deleted successfully"}

# Badge endpoints
@api_router.get("/badges", response_model=List[Badge])
async def get_all_badges():
    return await database.get_all_badges()

@api_router.get("/my-badges", response_model=List[Badge])
async def get_user_badges(current_user: User = Depends(get_current_user)):
    return await database.get_user_badges(current_user.id)

@api_router.post("/badges", response_model=Badge)
async def create_badge(badge_data: BadgeCreate):
    badge = Badge(**badge_data.dict())
    return await database.create_badge(badge)

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "ScratchKids API is running!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting ScratchKids API...")
    # Initialize default templates and badges
    await initialize_default_data()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down ScratchKids API...")
    await database.close()

async def initialize_default_data():
    """Initialize default project templates and badges"""
    try:
        # Check if templates already exist
        existing_templates = await database.get_all_templates()
        if len(existing_templates) == 0:
            # Create default templates
            default_templates = [
                ProjectTemplate(
                    title="Dancing Cat",
                    description="Make a cat dance to music with fun animations!",
                    difficulty="Beginner",
                    category="Animation",
                    thumbnail="🐱",
                    estimated_time="30 min",
                    steps=[
                        {"id": 1, "title": "Choose Your Cat", "description": "Select a cat sprite for your project"},
                        {"id": 2, "title": "Add a Stage", "description": "Pick a colorful background for your cat"},
                        {"id": 3, "title": "Make Cat Move", "description": "Use motion blocks to make your cat walk"},
                        {"id": 4, "title": "Add Music", "description": "Choose a fun song for your cat to dance to"},
                        {"id": 5, "title": "Dance Moves", "description": "Program different dance moves"},
                        {"id": 6, "title": "Add Effects", "description": "Make your cat sparkle and glow"},
                        {"id": 7, "title": "Color Changes", "description": "Change cat colors while dancing"},
                        {"id": 8, "title": "Add Props", "description": "Give your cat a hat or bow tie"},
                        {"id": 9, "title": "Final Performance", "description": "Put all moves together for a show"},
                        {"id": 10, "title": "Share Your Project", "description": "Save and share your dancing cat"}
                    ]
                ),
                ProjectTemplate(
                    title="Space Adventure",
                    description="Build a rocket ship game and explore the galaxy!",
                    difficulty="Beginner",
                    category="Game",
                    thumbnail="🚀",
                    estimated_time="45 min",
                    steps=[
                        {"id": 1, "title": "Create Your Rocket", "description": "Design a cool rocket ship sprite"},
                        {"id": 2, "title": "Space Background", "description": "Add a starry space background"},
                        {"id": 3, "title": "Rocket Controls", "description": "Use arrow keys to control the rocket"},
                        {"id": 4, "title": "Add Asteroids", "description": "Create moving asteroids to avoid"},
                        {"id": 5, "title": "Collision Detection", "description": "Program what happens when rocket hits asteroid"},
                        {"id": 6, "title": "Fuel System", "description": "Add a fuel gauge that decreases over time"},
                        {"id": 7, "title": "Collect Stars", "description": "Add stars to collect for points"},
                        {"id": 8, "title": "Sound Effects", "description": "Add rocket sounds and explosion effects"},
                        {"id": 9, "title": "Score System", "description": "Track and display the player score"},
                        {"id": 10, "title": "Game Over Screen", "description": "Create win/lose screens with restart option"}
                    ]
                ),
                ProjectTemplate(
                    title="Magic Garden",
                    description="Create a magical garden with growing flowers and butterflies!",
                    difficulty="Beginner",
                    category="Animation",
                    thumbnail="🌸",
                    estimated_time="35 min",
                    steps=[
                        {"id": 1, "title": "Garden Background", "description": "Choose a beautiful garden scene"},
                        {"id": 2, "title": "Plant Seeds", "description": "Add seed sprites to your garden"},
                        {"id": 3, "title": "Growing Animation", "description": "Make flowers grow when clicked"},
                        {"id": 4, "title": "Add Butterflies", "description": "Create colorful butterfly sprites"},
                        {"id": 5, "title": "Butterfly Movement", "description": "Make butterflies fly around flowers"},
                        {"id": 6, "title": "Weather Effects", "description": "Add rain and sun animations"},
                        {"id": 7, "title": "Magical Sparkles", "description": "Add sparkle effects to flowers"},
                        {"id": 8, "title": "Garden Sounds", "description": "Add nature sounds and music"},
                        {"id": 9, "title": "Day/Night Cycle", "description": "Change garden appearance over time"},
                        {"id": 10, "title": "Final Garden", "description": "Complete your magical garden world"}
                    ]
                )
            ]
            
            for template in default_templates:
                await database.create_template(template)
            
            logger.info(f"Created {len(default_templates)} default templates")
        
        # Check if badges already exist
        existing_badges = await database.get_all_badges()
        if len(existing_badges) == 0:
            # Create default badges
            default_badges = [
                Badge(
                    name="First Project",
                    icon="🏆",
                    description="Complete your first project",
                    requirements={"type": "first_project"}
                ),
                Badge(
                    name="Animation Master",
                    icon="🎬",
                    description="Complete 3 animation projects",
                    requirements={"type": "category_projects", "category": "Animation", "count": 3}
                ),
                Badge(
                    name="Game Developer",
                    icon="🎮",
                    description="Complete 3 game projects",
                    requirements={"type": "category_projects", "category": "Game", "count": 3}
                ),
                Badge(
                    name="Creative Coder",
                    icon="✨",
                    description="Complete 5 different projects",
                    requirements={"type": "projects_completed", "count": 5}
                ),
                Badge(
                    name="Music Maker",
                    icon="🎵",
                    description="Complete a music project",
                    requirements={"type": "category_projects", "category": "Music", "count": 1}
                ),
                Badge(
                    name="Story Teller",
                    icon="📖",
                    description="Complete a story project",
                    requirements={"type": "category_projects", "category": "Story", "count": 1}
                )
            ]
            
            for badge in default_badges:
                await database.create_badge(badge)
            
            logger.info(f"Created {len(default_badges)} default badges")
    
    except Exception as e:
        logger.error(f"Error initializing default data: {e}")