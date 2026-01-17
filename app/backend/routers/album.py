from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
import os
import shutil
import models, schemas, dependencies

router = APIRouter(
    prefix="/album",
    tags=["album"],
)

MAX_APP_SIZE_MB = 100
MAX_APP_SIZE_BYTES = MAX_APP_SIZE_MB * 1024 * 1024
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def get_total_size(db: Session):
    total_size = db.query(func.sum(models.AlbumItem.file_size)).scalar()
    return total_size or 0

@router.post("/upload", response_model=schemas.AlbumItem)
async def upload_file(
    file: UploadFile = File(...),
    is_public: bool = Form(False),
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(dependencies.get_db)
):
    # Check total size cap
    current_total = get_total_size(db)
    # Estimate file size (naive, as we receive stream)
    # Better: check content-length header or read chunks and count
    # For simplicity, we'll read into memory to check size (not ideal for huge files but ok for small apps)
    # Or save to temp and check. 
    
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if current_total + size > MAX_APP_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Storage limit of 100MB reached.")

    file_cat = "video" if file.content_type.startswith("video") else "image"
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    db_item = models.AlbumItem(
        file_path=file_location,
        file_size=size,
        media_type=file_cat,
        is_public=is_public,
        design_config=None, # Media upload currently doesn't send JSON design, will add later if needed
        owner_id=current_user.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[schemas.AlbumItem])
def read_album(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Retrieve user's items + public items? Or just user's?
    # Requirement: "photo/short video album section(public/private)"
    # Assuming this endpoint is for the user's dashboard/album view
    return db.query(models.AlbumItem).filter(models.AlbumItem.owner_id == current_user.id).offset(skip).limit(limit).all()

@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    item = db.query(models.AlbumItem).filter(models.AlbumItem.id == item_id, models.AlbumItem.owner_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted"}

@router.put("/{item_id}/design")
def update_item_design(
    item_id: int,
    design: dict = Body(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    item = db.query(models.AlbumItem).filter(models.AlbumItem.id == item_id, models.AlbumItem.owner_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.design_config = design
    db.commit()
    return item

@router.get("/public", response_model=List[schemas.AlbumItem])
def read_public_album(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db)):
    return db.query(models.AlbumItem).filter(models.AlbumItem.is_public == True).offset(skip).limit(limit).all()
