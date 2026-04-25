"""
AutoProcure AI — FastAPI Backend
Endpoints consumed by the Next.js frontend via lib/api.ts
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from agents.rfq_agent import RFQAgent

app = FastAPI(title="AutoProcure AI API", version="1.0.0")

# Allow the Next.js dev server (port 3000/3001) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rfq_agent = RFQAgent()


# ── Models ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str

class RFQRequest(BaseModel):
    requirement: str


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "AutoProcure AI API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/dashboard")
def dashboard():
    """Return summary stats shown in the dashboard header."""
    return {
        "vendors": 24,
        "alerts": 3,
        "docs": 47,
        "rfqs": 5,
    }


@app.get("/vendors")
def get_vendors():
    """Return the full vendor list."""
    return rfq_agent.vendor_db


@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    """Ingest a document (invoice / PO / contract)."""
    # TODO: wire up real document parsing (e.g. PyMuPDF + Groq)
    content = await file.read()
    return {
        "success": True,
        "filename": file.filename,
        "size_bytes": len(content),
        "message": "Document ingested successfully (mock).",
    }


@app.post("/chat")
def chat(req: ChatRequest):
    """Answer a procurement question using RAG + FAISS (mock for now)."""
    # TODO: replace with real RAG pipeline
    return {
        "answer": f"(Mock) You asked: '{req.query}'. Connect the RAG pipeline to get real answers.",
        "sources": [],
    }


@app.post("/rfq")
def generate_rfq(req: RFQRequest):
    """Generate an RFQ and return matched vendors."""
    if not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Requirement cannot be empty.")
    result = rfq_agent.run(req.requirement)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
