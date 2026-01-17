from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import models, schemas, dependencies
from datetime import datetime
import os

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Counts
    journal_count = db.query(models.JournalEntry).filter(models.JournalEntry.owner_id == current_user.id).count()
    blog_count = db.query(models.BlogPost).filter(models.BlogPost.owner_id == current_user.id).count()
    album_count = db.query(models.AlbumItem).filter(models.AlbumItem.owner_id == current_user.id).count()
    
    # Storage Calculation (MB)
    total_size_bytes = 0
    # Add logic for file sizes if we tracked them broadly, for now use album_items
    items = db.query(models.AlbumItem).filter(models.AlbumItem.owner_id == current_user.id).all()
    for item in items:
        total_size_bytes += (item.file_size or 0)
    
    storage_used_mb = round(total_size_bytes / (1024 * 1024), 2)
    
    # Recent Activity (Combined)
    activities = []
    
    recent_journals = db.query(models.JournalEntry).filter(models.JournalEntry.owner_id == current_user.id).order_by(models.JournalEntry.created_at.desc()).limit(5).all()
    for j in recent_journals:
        activities.append({
            "id": j.id,
            "type": "journal",
            "title": j.title,
            "created_at": j.created_at
        })
        
    recent_blogs = db.query(models.BlogPost).filter(models.BlogPost.owner_id == current_user.id).order_by(models.BlogPost.created_at.desc()).limit(5).all()
    for b in recent_blogs:
        activities.append({
            "id": b.id,
            "type": "blog",
            "title": b.title,
            "created_at": b.created_at
        })
        
    # Sort by created_at desc
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "journal_count": journal_count,
        "blog_count": blog_count,
        "album_count": album_count,
        "storage_used_mb": storage_used_mb,
        "recent_activity": activities[:8]
    }
