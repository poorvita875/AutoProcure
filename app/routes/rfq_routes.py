from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vendor import Vendor
from app.schemas.rfq_schema import RFQResponse
from app.schemas.vendor_schema import VendorCreate, VendorRead
from app.services.rfq_service import create_vendor, evaluate_rfq

router = APIRouter(prefix="", tags=["rfq"])

@router.get("/rfq", response_model=RFQResponse)
def get_rfq_recommendation(
    product: str = Query(..., min_length=1, description="Requested product name"),
    quantity: int = Query(..., gt=0, description="Requested quantity"),
    db: Session = Depends(get_db),
):
    try:
        return evaluate_rfq(db=db, product=product, quantity=quantity)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while evaluating RFQ.",
        ) from exc

@router.post("/vendors", response_model=VendorRead, status_code=status.HTTP_201_CREATED)
def add_vendor(payload: VendorCreate, db: Session = Depends(get_db)):
    try:
        return create_vendor(db=db, payload=payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create vendor.",
        ) from exc

@router.get("/vendors", response_model=List[VendorRead])
def get_all_vendors(db: Session = Depends(get_db)):
    try:
        return db.query(Vendor).all()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch vendors.",
        ) from exc
