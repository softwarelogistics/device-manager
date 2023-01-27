import { environment } from './../core/utils';
import { CookieService } from '../core/utils';

import { NuviotClientService } from './nuviot-client.service';


export class BusinessService {

  constructor(private nuviotClient: NuviotClientService,
    private cookieService: CookieService) {
  }

  public getTimeEntriesForTask(start: string, end: string, taskId: string, userId: string):
    Promise<Core.ListResponse<Business.TimeEntry>> {
    const filter = {
      'startDate': start,
      'endDate': end,
      'userId': userId,
      'workTaskId': taskId,
    };

    return this.nuviotClient.postForListResponse<Business.TimeEntryFilter, Business.TimeEntry>('/api/time/entries', filter);
  }

  public getTimeEntriesForUser(start: string, end: string, userId: string):
    Promise<Core.ListResponse<Business.TimeEntry>> {
    const filter = {
      'startDate': start,
      'endDate': end,
      'userId': userId,
    };

    return this.nuviotClient.postForListResponse<Business.TimeEntryFilter, Business.TimeEntry>('/api/time/entries', filter);
  }

  public addTimeEntry(timeRecord: Business.NewTimeEntry): Promise<Core.InvokeResultEx<Business.TimeEntry>> {
    const recentTimeEntry = {
      project: timeRecord.project,
      workTask: timeRecord.workTask,
    };

    const mruJson = this.cookieService.get('time-entry-mru');
    if (mruJson) {
      const mrus = JSON.parse(mruJson) as Business.RecentTimeEntry[];
      const existingMru = mrus.find(mru => mru.workTask.id === recentTimeEntry.workTask.id);
      if (existingMru) {
        mrus.splice(mrus.indexOf(existingMru), 1);
      }
      mrus.splice(10);
      mrus.unshift(recentTimeEntry);
      this.cookieService.set('time-entry-mru', JSON.stringify(mrus));
    } else {
      const mrus: Business.RecentTimeEntry[] = [];
      mrus.unshift(recentTimeEntry);
      this.cookieService.set('time-entry-mru', JSON.stringify(mrus));
    }

    return this.nuviotClient.postWithResponse<Business.NewTimeEntry, Business.TimeEntry>('/api/time/entry', timeRecord);
  }

  public updateTimeEntry(timeRecord: Business.TimeEntryUpdate): Promise<Core.InvokeResultEx<Business.TimeEntry>> {
    return this.nuviotClient.updateWithResponse('/api/time/entry', timeRecord);
  }

  public deleteTimeEntry(id: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/time/entry/${id}`);
  }

  public getExpensesForTask(start: string, end: string, taskId: string, userId: string):
    Promise<Core.ListResponse<Business.Expense>> {
    const filter = {
      'startDate': start,
      'endDate': end,
      'userId': userId,
      'taskId': taskId,
    };

    return this.nuviotClient.postForListResponse<Business.ExpenseFilter, Business.Expense>('/api/expense', filter);
  }

  public getExpensesForUser(start: string, end: string, userId: string):
    Promise<Core.ListResponse<Business.Expense>> {
    const filter = {
      'startDate': start,
      'endDate': end,
      'userId': userId,
    };

    return this.nuviotClient.postForListResponse<Business.ExpenseFilter, Business.Expense>('/api/expense', filter);
  }

  public addExpenses(expense: Business.Expense): Promise<Core.InvokeResultEx<Business.Expense>> {
    return this.nuviotClient.postWithResponse<Business.Expense, Business.Expense>(`/api/expense`, expense);
  }

  public updateExpenses(expense: Business.Expense): Promise<Core.InvokeResultEx<Business.Expense>> {
    return this.nuviotClient.updateWithResponse(`/api/expense`, expense);
  }

  public deleteExpenses(expenseId: Business.Expense): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/expense/${expenseId}`);
  }


  public getTimePeriods(year: Number): Promise<Core.ListResponse<Business.TimePeriod>> {
    return this.nuviotClient.getListResponse(`/api/time/timeperiods/${year}`);
  }

  public getAllTimePeriods(): Promise<Core.ListResponse<Business.TimePeriod>> {
    return this.nuviotClient.getListResponse(`/api/time/timeperiods`);
  }

  public createTimePeriods(year: Number): Promise<Core.ListResponse<Business.TimePeriod>> {
    return this.nuviotClient.getListResponse(`/api/time/timeperiods/${year}/create`);
  }

  public getCustomers(): Promise<Core.ListResponse<Business.Customer>> {
    return this.nuviotClient.getListResponse<Business.Customer>('/api/customers');
  }

  public getPayrollForYear(year: number) : Promise<Business.Payroll[]> {
    return this.nuviotClient.request<Business.Payroll[]>(`/api/payroll/year/${year}`);
  }

  public generatePayroll(timePeriodId: string) : Promise<Core.InvokeResultEx<Business.PayrollSummary>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.PayrollSummary>>(`/api/payroll/generate/${timePeriodId}`);
  }

  public getPaymentsForPeriod(timePeriodId: string) : Promise<Business.Payment[]> {
    return this.nuviotClient.request<Business.Payment[]>(`/api/payroll/payments/${timePeriodId}`);
  }

  public updatePayment(update: Business.PaymentUpdate): Promise<Core.InvokeResultEx<Business.Payment>> {
    return this.nuviotClient.updateWithResponse<Business.PaymentUpdate, Business.Payment>(`/api/payment/update`, update);
  }

  public generatePaymentsForPeriod(timePeriodId: string) : Promise<Core.InvokeResultEx<Business.PayrollSummary>> {
    return this.nuviotClient.requestForInvokeResultEx<Business.PayrollSummary>(`/api/payroll/generate/${timePeriodId}`);
  }

  public saveCustomer(customer: Business.Customer): Promise<Core.InvokeResultEx<Business.Customer>> {
    if (customer.id) {
      return this.nuviotClient.updateWithResponse<Business.Customer, Business.Customer>('/api/customer', customer);
    } else {
      return this.nuviotClient.postWithResponse<Business.Customer, Business.Customer>('/api/customer', customer);
    }
  }

  public getCustomer(customerId: string): Promise<Core.InvokeResultEx<Business.Customer>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.Customer>>(`/api/customer/${customerId}`);
  }

  public deleteCustomer(customerId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/customer/${customerId}`);
  }

  public getActiveAgreements(customerId: string): Promise<Core.ListResponse<Business.Agreement>> {
    return this.nuviotClient.request<Core.ListResponse<Business.Agreement>>(`/api/agreements/${customerId}/details`);
  }

  public getAgreements(customerId: string): Promise<Core.ListResponse<Business.Agreement>> {
    return this.nuviotClient.request<Core.ListResponse<Business.Agreement>>(`/api/agreements/${customerId}/active/details`);
  }

  public getActiveAgreementSummaries(customerId: string): Promise<Core.ListResponse<Business.AgreementSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Business.AgreementSummary>>(`/api/agreements/${customerId}/active`);
  }

  public getAgreementSummaries(customerId: string): Promise<Core.ListResponse<Business.AgreementSummary>> {
    return this.nuviotClient.request<Core.ListResponse<Business.AgreementSummary>>(`/api/agreements/${customerId}`);
  }

  public getAgreement(id: string): Promise<Core.InvokeResultEx<Business.Agreement>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.Agreement>>(`/api/agreement/${id}`);
  }

  public saveAgreement(agreement: Business.Agreement): Promise<Core.InvokeResultEx<Business.Agreement>> {
    if (agreement.id) {
      return this.nuviotClient.updateWithResponse<Business.Agreement, Business.Agreement>('/api/agreement', agreement);
    } else {
      return this.nuviotClient.postWithResponse<Business.Agreement, Business.Agreement>('/api/agreement', agreement);
    }
  }

  public deleteAgreement(agreementId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/agreement/${agreementId}`);
  }

  public getCurrentPayRate(userId: string): Promise<Core.InvokeResultEx<Business.PayRate>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.PayRate>>(`/api/payrate/user/${userId}/current`);
  }

  public getUserPayRates(userId: string): Promise<Core.ListResponse<Business.PayRate>> {
    return this.nuviotClient.getListResponse<Business.PayRate>(`/api/payrates/user/${userId}`);
  }

  public getPayRate(id: string): Promise<Core.InvokeResultEx<Business.PayRate>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.PayRate>>(`/api/payrate/${id}`);
  }

  public savePayRate(payRate: Business.PayRate): Promise<Core.InvokeResultEx<Business.PayRate[]>> {
    if (payRate.id) {
      return this.nuviotClient.updateWithResponse<Business.PayRate, Business.PayRate[]>('/api/payrate', payRate);
    } else {
      return this.nuviotClient.postWithResponse<Business.PayRate, Business.PayRate[]>('/api/payrate', payRate);
    }
  }

  public deletePayRate(payRateId: string): Promise<Core.InvokeResult> {
    return this.nuviotClient.delete(`/api/payrate/${payRateId}`);
  }

  public getTimeReport(filter: Business.TimeReportFilter): Promise<Core.InvokeResultEx<Business.TimeReportData>> {
    return this.nuviotClient.postWithResponse<Business.TimeReportFilter, Business.TimeReportData>('/api/reports/time', filter);
  }

  public downloadExcel(filter: Business.TimeReportFilter) {
    let uri = `${environment.siteUri}/api/reports/time/xlsx?entityGroupBy=${filter.entityGroupBy}`;

    if (filter.startDate) { uri += `&startDate=${encodeURIComponent(filter.startDate)}`; }
    if (filter.endDate) { uri += `&endDate=${encodeURIComponent(filter.endDate)}`; }
    if (filter.userId) { uri += `&userId=${encodeURIComponent(filter.userId)}`; }
    if (filter.clientId) { uri += `&userId=${encodeURIComponent(filter.clientId)}`; }
    if (filter.agreementId) { uri += `&userId=${encodeURIComponent(filter.agreementId)}`; }
    if (filter.projectId) { uri += `&projectId=${encodeURIComponent(filter.projectId)}`; }
    if (filter.workTaskId) { uri += `&workTaskId=${encodeURIComponent(filter.workTaskId)}`; }
    if (filter.includeFinancial) { uri += `&includeFinancial=true`; }
    if (filter.includeTaskDetails) { uri += `&includeTaskDetails=true`; }
    if (filter.timePeriodId) { uri += `&timePeriodId=${encodeURIComponent(filter.timePeriodId)}`; }
    window.open(uri, '_blank');
  }

  public lockTimePeriod(id: string): Promise<Core.InvokeResultEx<Business.TimePeriod>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.TimePeriod>>(`/api/time/timeperiod/${id}/lock`);
  }

  public unlockTimePeriod(id: string): Promise<Core.InvokeResultEx<Business.TimePeriod>> {
    return this.nuviotClient.request<Core.InvokeResultEx<Business.TimePeriod>>(`/api/time/timeperiod/${id}/unlock`);
  }
}
