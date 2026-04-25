from __future__ import annotations
import os, sys, shutil, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from agents.orchestrator import run_agent

router = APIRouter()

@router.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        result = run_agent({"pdf_path": tmp_path})
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
    return JSONResponse(content=result)
