import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routes import health, tasks, categories

logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT != "development" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("taskflow_backend")

app = FastAPI(
    title="TaskFlow API",
    description="High-performance, secure backend API for TaskFlow productivity suite.",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# CORS Configuration
origins = settings.allowed_origins_list
logger.info(f"Configuring CORS with allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Exception handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred. Please try again later."},
    )

# Register Routers
app.include_router(health.router)
app.include_router(tasks.router)
app.include_router(categories.router)


@app.get("/")
async def root():
    return {
        "service": "TaskFlow Backend API",
        "status": "online",
        "docs": "/docs" if settings.ENVIRONMENT != "production" else "disabled in production",
    }
