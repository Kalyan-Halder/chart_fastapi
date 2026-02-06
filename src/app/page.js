'use client'
import { useState, useEffect, useCallback } from "react";
import Division from "@/components/Division";
import AreaChartComponent from "@/components/AreaChartfComponent";
import BarChartComponent from "@/components/BarChartComponent";
import LineChartComponent from "@/components/LineChartComponent";
import ExpenseService from "@/app/services/expenseService";

const CATEGORIES = [
  "Food", "Housing", "Transport", "Entertainment", 
  "Bills", "Shopping", "Healthcare", "Education", "Other"
];

const INITIAL_EXPENSE = { name: "", amount: "", category: "Other" };

export default function Home() {
  const [monthlyIncome, setMonthlyIncome] = useState();
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState(INITIAL_EXPENSE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = monthlyIncome - totalExpenses;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isHealthy = await ExpenseService.healthCheck();
      if (!isHealthy) throw new Error('API server is not running');

      const [expensesData, incomeData, chartDataResponse] = await Promise.all([
        ExpenseService.getExpenses(),
        ExpenseService.getMonthlyIncome(),
        ExpenseService.getChartData()
      ]);

      setExpenses(expensesData);
      setMonthlyIncome(incomeData);
      setChartData(chartDataResponse);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async () => {
    if (!newExpense.name.trim() || !newExpense.amount || newExpense.amount <= 0) {
      alert("Please enter valid expense name and amount");
      return;
    }

    try {
      const expenseData = {
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category
      };

      const createdExpense = await ExpenseService.createExpense(expenseData);
      setExpenses(prev => [...prev, createdExpense]);
      setNewExpense(INITIAL_EXPENSE);
      
      const newChartData = await ExpenseService.getChartData();
      setChartData(newChartData);
    } catch (err) {
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await ExpenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      const newChartData = await ExpenseService.getChartData();
      setChartData(newChartData);
    } catch (err) {
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleUpdateExpense = async (id, field, value) => {
    try {
      const expenseToUpdate = expenses.find(expense => expense.id === id);
      if (!expenseToUpdate) return;

      const updatedData = {
        ...expenseToUpdate,
        [field]: field === 'amount' ? parseFloat(value) || 0 : value
      };

      const updatedExpense = await ExpenseService.updateExpense(id, updatedData);
      
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
      
      const newChartData = await ExpenseService.getChartData();
      setChartData(newChartData);
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  };

  const handleUpdateIncome = async (amount) => {
    try {
      const newIncome = await ExpenseService.updateMonthlyIncome(amount);
      setMonthlyIncome(newIncome);
    } catch (err) {
      setMonthlyIncome(amount);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 md:px-8 xl:px-10 py-8">
      <div className="w-full max-w-7xl mb-10">
        <h1 className="text-4xl font-bold text-center mb-2">Monthly Expense Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Track your monthly expenses and visualize spending patterns
        </p>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            ⚠️ {error} - Make sure FastAPI is running on http://localhost:8000
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mb-10">
        <SummaryCard 
          title="Monthly Income" 
          value={monthlyIncome} 
          onChange={handleUpdateIncome}
          color="green"
          description="Your total monthly income"
        />
        <SummaryCard 
          title="Total Expenses" 
          value={totalExpenses} 
          color="red"
          description={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''} this month`}
        />
        <SummaryCard 
          title="Remaining Balance" 
          value={remainingBalance} 
          color={remainingBalance >= 0 ? "green" : "red"}
          description={remainingBalance >= 0 ? 'Within budget' : 'Over budget'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl">
        <div className="space-y-8">
          <Division title="Add New Expense">
            <ExpenseForm 
              expense={newExpense}
              categories={CATEGORIES}
              onChange={setNewExpense}
              onSubmit={handleAddExpense}
            />
          </Division>

          <Division title={`Expenses (${expenses.length})`}>
            <ExpenseList 
              expenses={expenses}
              onUpdate={handleUpdateExpense}
              onDelete={handleDeleteExpense}
              categories={CATEGORIES}
              total={totalExpenses}
              remaining={remainingBalance}
            />
          </Division>
        </div>

        <div className="space-y-10">
          <Division title="Expense Distribution">
            <AreaChartComponent data={chartData?.area_chart} />
          </Division>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Division title="Monthly Trend">
              <BarChartComponent data={chartData?.bar_chart} />
            </Division>
            <Division title="Spending Pattern">
              <LineChartComponent data={chartData?.line_chart} />
            </Division>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Expense Tracker • Powered by FastAPI • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>
    </main>
  );
}

// Reusable Components
function SummaryCard({ title, value, onChange, color, description }) {
  const colorClasses = {
    green: 'text-green-600 border-green-500',
    red: 'text-red-600 border-red-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="flex items-center">
        <span className="text-2xl font-bold mr-2">$</span>
        {onChange ? (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={`text-3xl font-bold bg-transparent border-b-2 focus:outline-none w-full py-2 ${colorClasses[color]}`}
          />
        ) : (
          <span className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>
            {value.toFixed(2)}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
    </div>
  );
}

function ExpenseForm({ expense, categories, onChange, onSubmit }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expense Name
          </label>
          <input
            type="text"
            value={expense.name}
            onChange={(e) => onChange({...expense, name: e.target.value})}
            placeholder="e.g., Groceries, Rent, etc."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            value={expense.amount}
            onChange={(e) => onChange({...expense, amount: e.target.value})}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          value={expense.category}
          onChange={(e) => onChange({...expense, category: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Expense
      </button>
    </div>
  );
}

function ExpenseList({ expenses, onUpdate, onDelete, total, remaining }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No expenses added yet. Add your first expense above!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem 
          key={expense.id} 
          expense={expense} 
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
      
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Monthly Summary</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              ${total.toFixed(2)}
            </div>
            <div className={`text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remaining >= 0 ? 
                `$${remaining.toFixed(2)} remaining` : 
                `$${Math.abs(remaining).toFixed(2)} over budget`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseItem({ expense, onUpdate, onDelete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={expense.name}
            onChange={(e) => onUpdate(expense.id, 'name', e.target.value)}
            className="bg-transparent font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
          />
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
            {expense.category}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">$</span>
          <input
            type="number"
            value={expense.amount}
            onChange={(e) => onUpdate(expense.id, 'amount', e.target.value)}
            className="bg-transparent font-bold text-red-600 dark:text-red-400 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-24"
            min="0"
            step="0.01"
          />
        </div>
        <button
          onClick={() => onDelete(expense.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition"
          title="Delete expense"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}