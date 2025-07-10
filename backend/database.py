from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from models import User, UserProject, ProjectTemplate, Badge, UserBadge
import os
from datetime import datetime

class Database:
    def __init__(self):
        self.client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        self.db = self.client[os.environ['DB_NAME']]
        self.users = self.db.users
        self.projects = self.db.projects
        self.templates = self.db.templates
        self.badges = self.db.badges
        self.user_badges = self.db.user_badges

    async def close(self):
        self.client.close()

    # User operations
    async def create_user(self, user: User) -> User:
        result = await self.users.insert_one(user.dict())
        return user

    async def get_user_by_email(self, email: str) -> Optional[User]:
        user_data = await self.users.find_one({"email": email})
        return User(**user_data) if user_data else None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        user_data = await self.users.find_one({"id": user_id})
        return User(**user_data) if user_data else None

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        update_data["updated_at"] = datetime.utcnow()
        result = await self.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await self.get_user_by_id(user_id)
        return None

    # Project Template operations
    async def create_template(self, template: ProjectTemplate) -> ProjectTemplate:
        await self.templates.insert_one(template.dict())
        return template

    async def get_all_templates(self) -> List[ProjectTemplate]:
        templates = await self.templates.find().to_list(None)
        return [ProjectTemplate(**template) for template in templates]

    async def get_template_by_id(self, template_id: str) -> Optional[ProjectTemplate]:
        template_data = await self.templates.find_one({"id": template_id})
        return ProjectTemplate(**template_data) if template_data else None

    # User Project operations
    async def create_user_project(self, project: UserProject) -> UserProject:
        await self.projects.insert_one(project.dict())
        return project

    async def get_user_projects(self, user_id: str) -> List[UserProject]:
        projects = await self.projects.find({"user_id": user_id}).to_list(None)
        return [UserProject(**project) for project in projects]

    async def get_user_project_by_id(self, project_id: str) -> Optional[UserProject]:
        project_data = await self.projects.find_one({"id": project_id})
        return UserProject(**project_data) if project_data else None

    async def update_user_project(self, project_id: str, update_data: Dict[str, Any]) -> Optional[UserProject]:
        update_data["updated_at"] = datetime.utcnow()
        result = await self.projects.update_one(
            {"id": project_id},
            {"$set": update_data}
        )
        if result.modified_count:
            return await self.get_user_project_by_id(project_id)
        return None

    async def delete_user_project(self, project_id: str) -> bool:
        result = await self.projects.delete_one({"id": project_id})
        return result.deleted_count > 0

    # Badge operations
    async def create_badge(self, badge: Badge) -> Badge:
        await self.badges.insert_one(badge.dict())
        return badge

    async def get_all_badges(self) -> List[Badge]:
        badges = await self.badges.find().to_list(None)
        return [Badge(**badge) for badge in badges]

    async def get_badge_by_id(self, badge_id: str) -> Optional[Badge]:
        badge_data = await self.badges.find_one({"id": badge_id})
        return Badge(**badge_data) if badge_data else None

    async def award_badge_to_user(self, user_id: str, badge_id: str) -> UserBadge:
        user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
        await self.user_badges.insert_one(user_badge.dict())
        return user_badge

    async def get_user_badges(self, user_id: str) -> List[Badge]:
        user_badges = await self.user_badges.find({"user_id": user_id}).to_list(None)
        badge_ids = [ub["badge_id"] for ub in user_badges]
        if not badge_ids:
            return []
        badges = await self.badges.find({"id": {"$in": badge_ids}}).to_list(None)
        return [Badge(**badge) for badge in badges]

    async def check_and_award_badges(self, user_id: str) -> List[Badge]:
        user = await self.get_user_by_id(user_id)
        if not user:
            return []

        user_projects = await self.get_user_projects(user_id)
        user_badges = await self.get_user_badges(user_id)
        awarded_badge_ids = [badge.id for badge in user_badges]
        
        all_badges = await self.get_all_badges()
        newly_awarded = []

        for badge in all_badges:
            if badge.id in awarded_badge_ids:
                continue

            # Check badge requirements
            should_award = False
            req = badge.requirements

            if req.get("type") == "first_project" and user.completed_projects >= 1:
                should_award = True
            elif req.get("type") == "projects_completed" and user.completed_projects >= req.get("count", 0):
                should_award = True
            elif req.get("type") == "category_projects":
                category = req.get("category")
                count = req.get("count", 0)
                category_completed = len([p for p in user_projects if p.category.lower() == category.lower() and p.is_completed])
                if category_completed >= count:
                    should_award = True

            if should_award:
                await self.award_badge_to_user(user_id, badge.id)
                newly_awarded.append(badge)

        return newly_awarded

# Initialize database instance
database = Database()