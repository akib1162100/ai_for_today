from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, dependencies
import os

router = APIRouter(
    prefix="/blog",
    tags=["blog"],
)

@router.post("/", response_model=schemas.Blog)
def create_blog(
    blog: schemas.BlogCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_blog = models.BlogPost(**blog.dict(), owner_id=current_user.id)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

UPLOAD_DIR = "uploads/blog"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/{blog_id}/media")
async def upload_blog_media(
    blog_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id, models.BlogPost.owner_id == current_user.id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
        
    gallery = list(blog.media_gallery or [])
    for file in files:
        file_location = f"{UPLOAD_DIR}/{blog_id}_{file.filename}"
        with open(file_location, "wb+") as file_object:
            import shutil
            shutil.copyfileobj(file.file, file_object)
        
        media_type = "video" if file.content_type.startswith("video") else "image"
        gallery.append({"url": file_location, "type": media_type})
        
    blog.media_gallery = gallery
    db.commit()
    db.refresh(blog)
    return {"gallery": blog.media_gallery}

@router.put("/{blog_id}", response_model=schemas.Blog)
def update_blog(
    blog_id: int,
    blog_update: schemas.BlogCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id, models.BlogPost.owner_id == current_user.id).first()
    if not db_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    update_data = blog_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_blog, key, value)
    
    db.commit()
    db.refresh(db_blog)
    return db_blog

@router.delete("/{blog_id}")
def delete_blog(
    blog_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id, models.BlogPost.owner_id == current_user.id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"status": "deleted"}

@router.get("/", response_model=List[schemas.Blog])
def read_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db)):
    # Simple public feed or user specific? "ranking in blogs" suggests public/community aspect
    return db.query(models.BlogPost).order_by(models.BlogPost.ranking.desc()).offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.Blog])
def read_my_blogs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.BlogPost).filter(models.BlogPost.owner_id == current_user.id).offset(skip).limit(limit).all()

@router.put("/{blog_id}/rank")
def update_ranking(
    blog_id: int, 
    info: dict, # {"rank_delta": 1}
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    blog = db.query(models.BlogPost).filter(models.BlogPost.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Simple logic: upvote/downvote
    delta = info.get("rank_delta", 0)
    blog.ranking += delta
    db.commit()
    return {"new_ranking": blog.ranking}
