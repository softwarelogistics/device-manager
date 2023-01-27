/// <reference path="../core/core.ts" />

namespace Business {
  export interface TimeEntry {
    id: string;
    billingEventId: string;
    date: string;
    organizationId: Core.EntityHeader;
    project: Core.EntityHeader;
    workTask: Core.EntityHeader;
    userId: string;
    locked: boolean;
    hours: number;
    notes: string;
    originalHours: number;
    originalDate: string;
    originalNotes: string;
    value: string;
    originalValue: string;
  }

  export interface RecentTimeEntry {
    project: Core.EntityHeader;
    workTask: Core.EntityHeader;
  }

  export interface NewTimeEntry {
    date: string;
    project: Core.EntityHeader;
    workTask: Core.EntityHeader;
    userId: string;
    hours: number;
    notes: string;
  }

  export interface TimePeriod {
    id: string;
    year: number;
    start: string;
    end: string;
    locked: boolean;
  }

  export interface TimeEntryUpdate {
    id: string;
    date: string;
    hours: number;
    notes: string;
  }

  export interface TimeEntryFilter {
    projectId?: string;
    workTaskId?: string;
    userId?: string;
    startDate: string;
    endDate: string;
  }

  export interface TimeReportFilter {
    startDate?: string;
    endDate?: string;
    timePeriodId?: string;
    userId?: string;
    clientId?: string;
    agreementId?: string;
    projectId?: string;
    workTaskId?: string;
    includeFinancial: boolean;
    includeTaskDetails: boolean;
    entityGroupBy?: string;
  }

  export interface TimeReportData {
    summary: TimeReportDetail;
    rows: TimeReportDetail[];
  }

  export interface TimeReportDetail {
    summaryName: string;
    startDateStamp: string;
    endDateStamp: string;
    user: string;
    userId: string;
    client: string;
    clientId: string;
    agreement: string;
    agreementId: string;
    project: string;
    projectId: string;
    workTaskCode: string;
    externalWorkTaskCode: string;
    externalTaskLink: string;
    workTask: string;
    workTaskId: string;
    internalHours: number;
    billableHours: number;
    internalAmount: number;
    billableAmount: number;
    totalHours: number;
    totalAmount: number;
    revenue: number;
  }

  export interface ExpenseFilter {
    projectId?: string;
    workTaskId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }

  export interface Customer {
    id?: string;
    customerName: string;
    organizationId?: string;
    billingContactName: string;
    billingContactEmail: string;
    address1: string;
    address2: string;
    notes: string;
    city: string;
    state: string;
    zip: string;
    createdByUserId?: string;
    lastUpdatedByUserId?: string;
    creationDate?: string;
    lastUpdatedDate?: string;
  }

  export interface AgreementSummary {
    id: string;
    name: string;
    start: string;
    end: string;
    locked: boolean;
  }

  export interface Agreement {
    id?: string;
    organizationId?: string;
    customerId: string;
    name: string;
    identifier: string;
    locked: boolean;
    internal: boolean;
    start: string;
    end: string;
    hours: number;
    rate: number;
    notes: string;
    createdByUserId?: string;
    lastUpdatedByUserId?: string;
    creationDate?: string;
    lastUpdatedDate?: string;
  }

  export interface ExpenseSummary {
    id: string;
    user: string;
    date: string;
    description: string;
    category: string;
    categoryId: string;
    amount: number;
    reimbursedAmount: number;
    approved: boolean;
    payment: string;
  }

  export interface NewExpense {
    date?: string;
    userId?: string;
    amount?: number;
    category?: Core.EntityHeader;
    description?: string;
    project?: Core.EntityHeader;
    workTask?: Core.EntityHeader;
  }

  export interface ExpenseUpdate {
    id: string;
    date: string;
    amount: number;
    category: Core.EntityHeader;
    project?: Core.EntityHeader;
    workTask?: Core.EntityHeader;
    description: string;
  }

  export interface ExpenseCategoryView {
    key: Core.FormField;
    isActive: Core.FormField;
    requiresApproval: Core.FormField;
    name: Core.FormField;
    description: Core.FormField;
    reimbursementPercent: Core.FormField;
    deductiblePercent: Core.FormField;
  }

  export interface ExpenseCategory {
    id: string;
    createdById: string;
    lastUpdatedById: string;
    creationDate: Date;
    lastUpdateDate: Date;
    organizationId: string;
    key: string;
    isActive: boolean;
    requiresApproval: boolean;
    name: string;
    description: string;
    reimbursementPercent: number;
    deductiblePercent: number;
  }

  export interface NewExpenseCategory {
    name: string;
    key: string;
    description: string;
    reimbursementPercent: number;
    requiresApproval: boolean;
    isActive: boolean;
  }



  export interface Expense {
    id: string;
    agreementId: string;
    billingEventId: string;
    expenseCategoryId: string;
    date: Date;

    project: Core.EntityHeader;
    workTask: Core.EntityHeader;
    expenseCategory: Core.EntityHeader;

    description: string;
    notes: string;
    amount: string;
    locked: boolean;
    approved: boolean;
    approvedBy: Core.EntityHeader;
    approvedDate: string;
    userId: string;
    organizationId: string;
    createdByUserId: string;
    lastUpdatedByUserId: string;
    creationDate: string;
    lastUpdatedDate: string
  }

  export interface PayRate {
    id?: string;
    start: string;
    end?: string;
    notes: string;
    userId: string;
    isSalary: boolean;
    deductEstimated: boolean;
    deductEstimatedRate?: number;
    equityScaler?: number;
    billableRate?: number;
    internalRate?: number;
    salary?: number;
    deductions?: number;
    filingType?: string;
    organizationId?: string;
    createdByUserId?: string;
    lastUpdatedByUserId?: string;
    creationDate?: string;
    lastUpdatedDate?: string;
  }

  export interface PaymentSummary {
    start: string;
    end: string;
    userId: string;
    name: string;
    gross: number;
    net: number;
    equity: number;
    expenses: number;z
    status: Core.EntityHeader;
  }

export interface PaymentUpdate {
  paymentId: string;
  submittedDate: string;
  expectedDeliveryDate: string;
  primaryTransactionId: string;
  secondaryTransactionId: string;
}

  export interface Deduction {
    deductionType: string;
    deductionAmount: number;
  }

  export interface ExpenseReimbursement {
    expenseId: string;
    category: string;
    categoryId: string;
    submittedAmount: number;
    reimbursedAmount: number;
  }

  export interface Payment {
    id: string;
    paymentStatus: Core.EntityHeader;
    timePeriodId: string;
    user: Core.EntityHeader;
    organization: Core.EntityHeader;
    start: string;
    end: string;
    billableHours: number;
    internalHours: number;
    equityHours: number;
    gross: number;
    net: number;
    submittedDate: string;
    expectedDeliveryDate: string;
    primaryDeposit: number;
    estimatedDeposit: number;
    expenses: number;
    earnedEquity: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    primaryTransactionId: string;
    secondaryTransactionId: string;
    createdByUserId: string;
    lastUpdatedByUserId: string;
    creationDate: string;
    lastUpdatedDate: string;
    deductions: Deduction[];
    expenseReimbursements: ExpenseReimbursement[];
  }




  export interface PayrollSummary {
    id: string;
    timePeriod: Core.EntityHeader;
    totalPayroll: number;
    totalExpenses: number;
    totalTaxLiability: number;
    totalRevenue: number;
    taxLiabilities: Deduction[];
    status: string;
    locked: boolean;
    lockedTimeStamp: string;
    lockedByUser: Core.EntityHeader;
    creationDate: string;
    lastUpdatedDate: string;
    createdBy: Core.EntityHeader;
    lastUpdatedBy: Core.EntityHeader;
    organization: Core.EntityHeader;
  }

  export interface Payroll {
    id: string;
    year: number;
    start: string;
    end: string;
    details: PayrollSummary;
  }
}
