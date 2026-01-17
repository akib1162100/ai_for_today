from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import journal, album, blog, profile, auth, dashboard
from fastapi.middleware.cors import CORSMiddleware

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Private Space App")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, verify this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(journal.router)
app.include_router(album.router)
app.include_router(blog.router)
app.include_router(profile.router)
app.include_router(dashboard.router)

# Mount Static Files (Uploads)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to your Private Space"}
