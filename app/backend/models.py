from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_picture = Column(String, nullable=True) # Path to pfp
    profile_theme = Column(JSON, nullable=True) # Global profile theme
    
    journals = relationship("JournalEntry", back_populates="owner")
    album_items = relationship("AlbumItem", back_populates="owner")
    blog_posts = relationship("BlogPost", back_populates="owner")
    profile_sections = relationship("ProfileSection", back_populates="owner")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    media_gallery = Column(JSON, nullable=True) # List of {url, type}
    is_public = Column(Boolean, default=False)
    design_config = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="journals")

class AlbumItem(Base):
    __tablename__ = "album_items"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    file_size = Column(Integer)
    media_type = Column(String)
    is_public = Column(Boolean, default=False)
    design_config = Column(JSON, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="album_items")

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    tags = Column(String)
    media_gallery = Column(JSON, nullable=True) # List of {url, type}
    ranking = Column(Integer, default=0)
    design_config = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="blog_posts")

class ProfileSection(Base):
    __tablename__ = "profile_sections"

    id = Column(Integer, primary_key=True, index=True)
    section_type = Column(String)
    title = Column(String)
    content = Column(Text)
    media_gallery = Column(JSON, nullable=True) # List of {url, type}
    design_config = Column(JSON, nullable=True) # Per-section theme
    order = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="profile_sections")
