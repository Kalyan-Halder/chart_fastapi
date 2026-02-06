const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ExpenseService {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.headers.get('content-type')?.includes('application/json') 
        ? await response.json() 
        : null;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Expense operations
  static getExpenses() {
    return this.request('/api/expenses');
  }

  static createExpense(data) {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static updateExpense(id, data) {
    return this.request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static deleteExpense(id) {
    return this.request(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Monthly income operations
  static getMonthlyIncome() {
    return this.request('/api/monthly-income')
      .then(data => data?.amount || 0)
      .catch(() => 3000);
  }

  static updateMonthlyIncome(amount) {
    return this.request('/api/monthly-income', {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    }).then(data => data?.amount || amount)
      .catch(() => amount);
  }

  // Chart data
  static getChartData() {
    return this.request('/api/chart-data');
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/`, { timeout: 3000 });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default ExpenseService;