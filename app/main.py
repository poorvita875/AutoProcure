import os
from fastapi import FastAPI
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.routes.rfq_routes import router as rfq_router
from app.services.rfq_service import seed_sample_vendors

def create_app() -> FastAPI:
    app = FastAPI(
        title="SupplyMind AI - RFQ Agent",
        description="Production-ready RFQ recommendation service for procurement.",
        version="1.0.0",
    )

    app.include_router(rfq_router)
    app.state.db_ready = False
    app.state.db_error = None

    @app.on_event("startup")
    def startup_event() -> None:
        try:
            Base.metadata.create_all(bind=engine)

            if settings.AUTO_SEED_DATA:
                db = SessionLocal()
                try:
                    seed_sample_vendors(db)
                finally:
                    db.close()

            app.state.db_ready = True
            app.state.db_error = None
        except SQLAlchemyError as exc:
            app.state.db_ready = False
            app.state.db_error = str(exc)

    @app.get("/health", tags=["health"])
    def health() -> dict:
        if app.state.db_ready:
            return {"status": "ok", "database": "connected"}
        return {"status": "degraded", "database": "unavailable", "reason": app.state.db_error}

    return app

app = create_app()
