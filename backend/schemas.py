from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ExpenseBase(BaseModel):
    name: str
    amount: float
    category: str


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class IncomeBase(BaseModel):
    amount: float


class IncomeResponse(IncomeBase):
    id: int
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ChartData(BaseModel):
    area_chart: list
    bar_chart: list
    line_chart: list