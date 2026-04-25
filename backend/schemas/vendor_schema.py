from pydantic import BaseModel, Field

class VendorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    product: str = Field(..., min_length=1, max_length=255)
    price: float = Field(..., gt=0)
    delivery_days: int = Field(..., ge=0)
    rating: float = Field(..., ge=0, le=5)

class VendorCreate(VendorBase):
    pass

class VendorRead(VendorBase):
    id: int

    class Config:
        from_attributes = True
