from sqlalchemy import Column, Float, Integer, String

from app.core.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    product = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    rating = Column(Float, nullable=False)
