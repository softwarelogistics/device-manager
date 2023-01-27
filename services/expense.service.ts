
import { NuviotClientService } from './nuviot-client.service';


export class ExpenseService {

  constructor(private client: NuviotClientService) { }

  getExpenses(filter: Business.ExpenseFilter): Promise<Core.ListResponse<Business.ExpenseSummary>>{
    return this.client.postForListResponse<Business.ExpenseFilter, Business.ExpenseSummary>('/api/expenses', filter);
  }

  addExpense(expense: Business.NewExpense) : Promise<Core.InvokeResultEx<Business.ExpenseSummary>> {
    return this.client.post<Business.NewExpense, Business.ExpenseSummary>('/api/expense', expense)
  }

  updateExpense(expense: Business.ExpenseUpdate): Promise<Core.InvokeResultEx<Business.ExpenseSummary>> {
    return this.client.updateWithResponse<Business.ExpenseUpdate, Business.ExpenseSummary>('/api/expense', expense);
  }

  getExpense(id: string): Promise<Business.ExpenseSummary> {
    return this.client.request(`/api/expense/${id}`);
  }

  deleteExpense(id: string) {
    return this.client.delete(`/api/expense/${id}`);
  }

  factory() : Promise<Core.FormResult<Business.ExpenseCategory, Business.ExpenseCategoryView>>{
    return this.client.request<Core.FormResult< Business.ExpenseCategory, Business.ExpenseCategoryView>>('/api/expensecategory/factory');
  }

  getExpenseCategories() : Promise<Business.ExpenseCategory[]>{
    return this.client.request<Business.ExpenseCategory[]>('/api/expensecategories');
  }

  getActiveExpenseCategories() : Promise<Business.ExpenseCategory[]>{
    return this.client.request<Business.ExpenseCategory[]>('/api/expensecategories/active');
  }

  addExpenseCategory(expenseCategory: Business.ExpenseCategory) : Promise<Core.InvokeResult> {
    return this.client.post('/api/expensecategory', expenseCategory);
  }

  updateExpenseCategory(expenseCategory: Business.ExpenseCategory) {
    return this.client.update('/api/expensecategory', expenseCategory);
  }
}

