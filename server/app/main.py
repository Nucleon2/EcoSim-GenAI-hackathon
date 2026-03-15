import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.simulate import router as simulate_router
from app.api.explain import router as explain_router
from app.api.optimize import router as optimize_router
from app.api.draft import router as draft_router

app = FastAPI(title="AI Climate Policy Copilot")

_cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router, prefix="/api")
app.include_router(explain_router, prefix="/api")
app.include_router(optimize_router, prefix="/api")
app.include_router(draft_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok"}
