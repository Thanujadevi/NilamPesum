import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.init_db import init_database
from app.api import (
    farmlands, nasa, analytics, recommendations,
    simulations, farm_ops, voice, reports, officer,
    auth, plots, simulation_world
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nilam_pesum.main")

# Initialize database tables & reference seed data synchronously once at module load
try:
    init_database()
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.exception(f"Database init error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NILAM PESUM Backend Server Ready.")
    yield
    logger.info("NILAM PESUM Backend Server Stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="NASA-Powered AI Agricultural Intelligence, Satellite Monitoring and Smart Crop Rotation Recommendation Platform",
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(farmlands.router, prefix="/api")
app.include_router(plots.router, prefix="/api")
app.include_router(simulation_world.router, prefix="/api")
app.include_router(nasa.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(simulations.router, prefix="/api")
app.include_router(farm_ops.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(officer.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "NILAM PESUM (நிலம் பேசும்)",
        "version": settings.VERSION,
        "nasa_provider": "NASA Earth Science Data Systems",
        "agronomic_reference": "TNAU & ICAR"
    }

@app.get("/")
def root():
    return {
        "title": "NILAM PESUM (நிலம் பேசும்) API",
        "tagline": "Let Your Land Speak. Let Data Guide Your Farming.",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
