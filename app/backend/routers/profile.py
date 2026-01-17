import models, schemas, dependencies
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from sqlalchemy.orm import Session
from typing import List, Dict
import shutil
import os

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)

UPLOAD_DIR = "uploads/profile"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/section", response_model=schemas.ProfileSection)
def create_section(
    section: schemas.ProfileSectionCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_section = models.ProfileSection(**section.dict(), owner_id=current_user.id)
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section

@router.post("/section/{section_id}/media")
async def upload_section_media(
    section_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    section = db.query(models.ProfileSection).filter(models.ProfileSection.id == section_id, models.ProfileSection.owner_id == current_user.id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
        
    gallery = list(section.media_gallery or [])
    for file in files:
        file_location = f"{UPLOAD_DIR}/sec_{section_id}_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        media_type = "video" if file.content_type.startswith("video") else "image"
        gallery.append({"url": file_location, "type": media_type})
        
    section.media_gallery = gallery
    db.commit()
    db.refresh(section)
    return {"gallery": section.media_gallery}

@router.post("/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    file_location = f"{UPLOAD_DIR}/user_{current_user.id}_{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    current_user.profile_picture = file_location
    db.commit()
    return {"profile_picture": file_location}

@router.put("/theme")
def update_profile_theme(
    theme: dict = Body(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    current_user.profile_theme = theme
    db.commit()
    return {"profile_theme": theme}

@router.put("/reorder")
def reorder_sections(
    order_map: Dict[int, int] = Body(...), # {section_id: new_order_index}
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    sections = db.query(models.ProfileSection).filter(models.ProfileSection.owner_id == current_user.id).all()
    for section in sections:
        if str(section.id) in order_map or section.id in order_map:
             # handle string keys from JSON
             key = str(section.id)
             val = order_map.get(key) or order_map.get(section.id)
             section.order = val
    db.commit()
    return {"status": "success"}

@router.put("/section/{section_id}", response_model=schemas.ProfileSection)
def update_section(
    section_id: int,
    section_update: schemas.ProfileSectionCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_section = db.query(models.ProfileSection).filter(models.ProfileSection.id == section_id, models.ProfileSection.owner_id == current_user.id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    update_data = section_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_section, key, value)
    
    db.commit()
    db.refresh(db_section)
    return db_section

@router.delete("/section/{section_id}")
def delete_section(
    section_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    section = db.query(models.ProfileSection).filter(models.ProfileSection.id == section_id, models.ProfileSection.owner_id == current_user.id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    db.delete(section)
    db.commit()
    return {"status": "deleted"}

@router.get("/", response_model=List[schemas.ProfileSection])
def get_profile(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.ProfileSection).filter(models.ProfileSection.owner_id == current_user.id).order_by(models.ProfileSection.order).all()

@router.get("/me", response_model=schemas.User)
def get_my_profile_meta(
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return current_user
