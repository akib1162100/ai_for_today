from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile_picture: Optional[str] = None
    profile_theme: Optional[dict] = None
    class Config:
        from_attributes = True

class JournalBase(BaseModel):
    title: str
    content: str
    is_public: bool = False

class JournalCreate(JournalBase):
    design_config: Optional[dict] = None

class Journal(JournalBase):
    id: int
    created_at: datetime
    media_gallery: Optional[List[dict]] = None
    design_config: Optional[dict] = None
    owner_id: int
    owner: Optional[User] = None
    class Config:
        from_attributes = True

class AlbumItemBase(BaseModel):
    is_public: bool = False

class AlbumItem(AlbumItemBase):
    id: int
    file_path: str
    file_size: int
    media_type: str
    design_config: Optional[dict] = None
    owner_id: int
    owner: Optional[User] = None
    class Config:
        from_attributes = True

class BlogBase(BaseModel):
    title: str
    content: str
    tags: Optional[str] = None

class BlogCreate(BlogBase):
    design_config: Optional[dict] = None

class Blog(BlogBase):
    id: int
    ranking: int
    created_at: datetime
    media_gallery: Optional[List[dict]] = None
    design_config: Optional[dict] = None
    owner_id: int
    owner: Optional[User] = None
    class Config:
        from_attributes = True

class ProfileSectionBase(BaseModel):
    section_type: str
    title: str
    content: str
    design_config: Optional[dict] = None
    order: int = 0

class ProfileSectionCreate(ProfileSectionBase):
    pass

class ProfileSection(ProfileSectionBase):
    id: int
    media_gallery: Optional[List[dict]] = None
    owner_id: int
    owner: Optional[User] = None
    class Config:
        from_attributes = True
class RecentActivity(BaseModel):
    id: int
    type: str
    title: str
    created_at: datetime

class DashboardStats(BaseModel):
    journal_count: int
    blog_count: int
    album_count: int
    storage_used_mb: float
    recent_activity: List[RecentActivity]
