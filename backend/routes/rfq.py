"""
backend/routes/rfq.py
=====================
FastAPI router — POST /rfq

Accepts a plain-English procurement request, runs it through the
LangGraph orchestrator (which delegates to RfqAgent), and returns a
structured JSON response.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/rfq", tags=["RFQ Agent"])


# ──────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────────────────────────────────────────

class RFQRequest(BaseModel):
    """
    Body accepted by POST /rfq.

    The field is named ``product_request`` to match the orchestrator's
    routing key:
        elif data.get("product_request"):
            intent = "rfq"
    """

    product_request: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Plain-English procurement requirement",
        examples=["Need 200 TMT steel rods for construction project"],
    )


class RFQResponse(BaseModel):
    """
    Structured response from RfqAgent.
    All non-essential fields are Optional so error responses also validate.
    """

    success:         bool
    rfq_id:          int | None       = None
    rfq_text:        str | None       = None
    item_name:       str | None       = None
    quantity:        int | None       = None
    unit:            str | None       = None
    vendors_matched: int | None       = None
    vendor_names:    list[str] | None = None
    error:           str | None       = None


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=RFQResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate RFQ",
    description=(
        "Accepts a plain-English procurement requirement.\n\n"
        "**Pipeline (via orchestrator → RfqAgent)**\n"
        "1. Classify intent from `product_request` key\n"
        "2. Extract structured intent via Groq LLM\n"
        "3. Match vendors from PostgreSQL by category\n"
        "4. Draft a professional RFQ email via Groq LLM\n"
        "5. Persist the RFQ to the `rfqs` table\n"
        "6. Return a fully structured result"
    ),
)
def generate_rfq(payload: RFQRequest) -> Any:
    """POST /rfq — route through the LangGraph orchestrator to RfqAgent."""
    try:
        # Late import — keeps startup fast and avoids circular-import issues
        from agents.orchestrator import run_agent

        # Pass the orchestrator's expected key: "product_request"
        result: dict = run_agent({"product_request": payload.product_request})

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("error", "RFQ generation failed"),
            )

        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected server error: {exc}",
        ) from exc


@router.get(
    "/health",
    summary="RFQ agent health check",
    tags=["health"],
)
def rfq_health() -> dict[str, str]:
    """GET /rfq/health — liveness probe for this router."""
    return {"status": "ok", "agent": "RfqAgent"}
