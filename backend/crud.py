from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from fastapi import HTTPException

# Fixed imports:
from models import Expense, MonthlyIncome
from schemas import ExpenseCreate, ExpenseUpdate


# Expense CRUD operations
def get_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Expense).order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()


def get_expense(db: Session, expense_id: int):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


def create_expense(db: Session, expense: ExpenseCreate):
    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def update_expense(db: Session, expense_id: int, expense: ExpenseUpdate):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        update_data = expense.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_expense, key, value)
        db.commit()
        db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense


# Income operations
def get_monthly_income(db: Session):
    income = db.query(MonthlyIncome).first()
    if not income:
        # Create default income if none exists
        income = MonthlyIncome(amount=3000)
        db.add(income)
        db.commit()
        db.refresh(income)
    return income


def update_monthly_income(db: Session, amount: float):
    income = get_monthly_income(db)
    income.amount = amount
    db.commit()
    db.refresh(income)
    return income


# Chart data generation
def get_chart_data(db: Session):
    # Get expenses by category for area chart
    category_data = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).group_by(Expense.category).all()
    
    area_chart = [{"category": cat, "value": float(total)} for cat, total in category_data]
    
    # Generate bar chart data (expenses by day of current month)
    now = datetime.now()
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    daily_data = db.query(
        extract('day', Expense.created_at).label('day'),
        func.sum(Expense.amount).label('total')
    ).filter(
        Expense.created_at >= first_day
    ).group_by('day').all()
    
    # Create array for 30 days
    bar_chart = [0] * 30
    for day, total in daily_data:
        if 1 <= day <= 30:
            bar_chart[int(day) - 1] = float(total)
    
    # Generate line chart data (expenses by month for last 12 months)
    twelve_months_ago = now - timedelta(days=365)
    
    monthly_data = db.query(
        extract('month', Expense.created_at).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter(
        Expense.created_at >= twelve_months_ago
    ).group_by('month').all()
    
    # Create array for 12 months
    line_chart = [0] * 12
    for month, total in monthly_data:
        if 1 <= month <= 12:
            line_chart[int(month) - 1] = float(total)
    
    return {
        "area_chart": area_chart,
        "bar_chart": bar_chart,
        "line_chart": line_chart
    }