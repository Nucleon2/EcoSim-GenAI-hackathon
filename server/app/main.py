from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.simulate import router as simulate_router
from app.api.explain import router as explain_router
from app.api.optimize import router as optimize_router
from app.api.draft import router as draft_router

app = FastAPI(title="AI Climate Policy Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
