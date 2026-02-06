from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base  # Fixed import


class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MonthlyIncome(Base):
    __tablename__ = "monthly_income"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False, default=3000)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())