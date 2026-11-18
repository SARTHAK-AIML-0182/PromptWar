from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router as api_router
from app.storage.db import init_db

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Multi-agent decision & reliability platform for startup founders."
)

# Allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema
init_db()

# Mount API endpoints
app.include_router(api_router, prefix="/api")

# Optionally serve static frontend if built
frontend_dist = settings.benchmarks_path.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {
            "message": "Startup Co-Pilot Backend API is live.",
            "docs_url": "/docs",
            "health_check": "/api/health"
        }
