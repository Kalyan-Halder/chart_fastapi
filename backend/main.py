from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
from models import Expense, MonthlyIncome
from schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse, IncomeBase, IncomeResponse, ChartData
from crud import (
    get_expenses,
    get_expense,  # Make sure this is imported
    create_expense,
    update_expense,
    delete_expense,
    get_monthly_income,
    update_monthly_income,
    get_chart_data
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Expense Tracker API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Expense routes
@app.get("/api/expenses", response_model=List[ExpenseResponse])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_expenses(db, skip=skip, limit=limit)

@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense_route(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return create_expense(db, expense)

@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense_route(expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db)):
    db_expense = get_expense(db, expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return update_expense(db, expense_id, expense)

@app.delete("/api/expenses/{expense_id}")
def delete_expense_route(expense_id: int, db: Session = Depends(get_db)):
    db_expense = get_expense(db, expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    delete_expense(db, expense_id)
    return {"message": "Expense deleted successfully"}

# Monthly income routes
@app.get("/api/monthly-income", response_model=IncomeResponse)
def get_monthly_income_route(db: Session = Depends(get_db)):
    return get_monthly_income(db)

@app.put("/api/monthly-income", response_model=IncomeResponse)
def update_monthly_income_route(income: IncomeBase, db: Session = Depends(get_db)):
    return update_monthly_income(db, income.amount)

# Chart data route
@app.get("/api/chart-data", response_model=ChartData)
def get_chart_data_route(db: Session = Depends(get_db)):
    return get_chart_data(db)