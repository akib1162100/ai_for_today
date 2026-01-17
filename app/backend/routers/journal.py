from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, dependencies
import shutil
import os

router = APIRouter(
    prefix="/journal",
    tags=["journal"],
)

UPLOAD_DIR = "uploads/journal"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/", response_model=schemas.Journal)
def create_journal(
    journal: schemas.JournalCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_journal = models.JournalEntry(**journal.dict(), owner_id=current_user.id)
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)
    return db_journal

@router.post("/upload/{journal_id}")
async def upload_journal_media(
    journal_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    journal = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_id, models.JournalEntry.owner_id == current_user.id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
        
    gallery = list(journal.media_gallery or [])
    for file in files:
        file_location = f"{UPLOAD_DIR}/{journal_id}_{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        media_type = "video" if file.content_type.startswith("video") else "image"
        gallery.append({"url": file_location, "type": media_type})
        
    journal.media_gallery = gallery
    db.commit()
    db.refresh(journal)
    return {"gallery": journal.media_gallery}

@router.put("/{journal_id}", response_model=schemas.Journal)
def update_journal(
    journal_id: int,
    journal_update: schemas.JournalCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    db_journal = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_id, models.JournalEntry.owner_id == current_user.id).first()
    if not db_journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    
    update_data = journal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_journal, key, value)
    
    db.commit()
    db.refresh(db_journal)
    return db_journal

@router.delete("/{journal_id}")
def delete_journal(
    journal_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    journal = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_id, models.JournalEntry.owner_id == current_user.id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(journal)
    db.commit()
    return {"status": "deleted"}

@router.get("/", response_model=List[schemas.Journal])
def read_journals(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.JournalEntry).filter(models.JournalEntry.owner_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/{journal_id}", response_model=schemas.Journal)
def read_journal(journal_id: int, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    journal = db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_id, models.JournalEntry.owner_id == current_user.id).first()
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return journal
