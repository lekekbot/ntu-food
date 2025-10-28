from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import uvicorn
import logging
import traceback

from app.database.database import Base, engine
from app.routes import auth, auth_otp, stalls, orders, menu, queue, users, admin
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import models to ensure they're registered
    from app.models import user, stall, menu, order, queue, otp
    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info(f"NTU Food API started in {settings.ENVIRONMENT} mode")
    yield
    logger.info("NTU Food API shutting down")

app = FastAPI(
    title="NTU Food API",
    description="Backend API for NTU Food Ordering System",
    version="0.1.0",
    lifespan=lifespan
)

# Parse CORS origins from environment variable
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}\n{traceback.format_exc()}")

    # Don't expose internal errors in production
    if settings.ENVIRONMENT == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "An internal server error occurred. Please try again later.",
                "type": "internal_server_error"
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc()
            }
        )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "type": "validation_error"
        }
    )

@app.get("/")
async def root():
    return {
        "message": "Welcome to NTU Food API",
        "version": "0.1.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auth_otp.router, prefix="/api/auth/otp", tags=["OTP Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(stalls.router, prefix="/api/stalls", tags=["Stalls"])
app.include_router(menu.router, prefix="/api/menu", tags=["Menu"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )