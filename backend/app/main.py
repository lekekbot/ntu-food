from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.database.database import Base, engine
from app.routes import auth, stalls, orders, menu, queue, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import models to ensure they're registered
    from app.models import user, stall, menu, order, queue
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="NTU Food API",
    description="Backend API for NTU Food Ordering System",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(stalls.router, prefix="/api/stalls", tags=["Stalls"])
app.include_router(menu.router, prefix="/api/menu", tags=["Menu"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )