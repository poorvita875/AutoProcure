from typing import List

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.schemas.vendor_schema import VendorCreate
from app.services.llm_service import generate_explanation
from app.services.scoring_service import rank_vendors

def create_vendor(db: Session, payload: VendorCreate) -> Vendor:
    vendor = Vendor(
        name=payload.name,
        product=payload.product.lower().strip(),
        price=payload.price,
        delivery_days=payload.delivery_days,
        rating=payload.rating,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor

def get_vendors_by_product(db: Session, product: str) -> List[Vendor]:
    return (
        db.query(Vendor)
        .filter(Vendor.product == product.lower().strip())
        .order_by(Vendor.id.asc())
        .all()
    )

def evaluate_rfq(db: Session, product: str, quantity: int) -> dict:
    """
    Quantity is accepted to match RFQ contract and allow future
    volume-tier pricing logic. Current scoring is vendor-level.
    """
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0.")

    vendors = get_vendors_by_product(db, product=product)
    
    # Advanced logic: Validate minimum 2 vendors
    if len(vendors) < 2:
        raise ValueError(f"At least 2 vendors are required for product '{product}' to perform comparison.")

    ranked = rank_vendors(vendors)
    best_vendor = ranked[0]["vendor"]
    explanation = generate_explanation(best_vendor=best_vendor, all_vendors=vendors)

    return {
        "product": product,
        "best_vendor": best_vendor,
        "vendor_comparison": ranked,
        "explanation": explanation,
    }

def seed_sample_vendors(db: Session) -> None:
    if db.query(Vendor).first():
        return

    sample = [
        Vendor(
            name="Apex Industrial",
            product="steel",
            price=490.0,
            delivery_days=6,
            rating=4.4,
        ),
        Vendor(
            name="Nova Metals",
            product="steel",
            price=470.0,
            delivery_days=8,
            rating=4.2,
        ),
        Vendor(
            name="Rapid Supply Co",
            product="steel",
            price=515.0,
            delivery_days=4,
            rating=4.8,
        ),
        Vendor(
            name="Eco Plastics",
            product="polymer",
            price=210.0,
            delivery_days=5,
            rating=4.6,
        ),
        Vendor(
            name="Prime Resins",
            product="polymer",
            price=195.0,
            delivery_days=9,
            rating=4.1,
        ),
    ]
    db.add_all(sample)
    db.commit()
