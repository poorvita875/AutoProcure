from __future__ import annotations
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from agents.orchestrator import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat(req: ChatRequest):
    result = run_agent({"query": req.query})
    return JSONResponse(content=result)
