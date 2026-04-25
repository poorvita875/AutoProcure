from typing import List

from pydantic import BaseModel

from app.schemas.vendor_schema import VendorRead

class VendorScore(BaseModel):
    vendor: VendorRead
    score: float

class RFQResponse(BaseModel):
    product: str
    best_vendor: VendorRead
    vendor_comparison: List[VendorScore]
    explanation: str
