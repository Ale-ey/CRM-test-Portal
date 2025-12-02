export type CaseStatus = 'New' | 'In Progress' | 'On Hold' | 'Closed' | 'Paid' | 'Open';

export type CaseRecord = {
  caseId: string;
  clientId: string;
  reference?: string;
  clientName: string;
  debtorName: string;
  customerContactName?: string;
  customerContactEmail?: string;
  customerAddress1?: string;
  customerAddress2?: string;
  debtorAddress1?: string;
  debtorAddress2?: string;
  debtorCity?: string;
  debtorState?: string;
  debtorZip?: string;
  debtorCountry?: string;
  debtorPhone?: string;
  debtorEmail?: string;
  openedDate?: string;
  dueDate?: string;
  lastActivityDate?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  principalAmount: number;
  interestAmount?: number;
  feesBeforeSubmission?: number;
  feesAfterSubmission?: number;
  feesAmount?: number;
  totalAmountDue?: number;
  collectedAmount: number;
  balanceAmount?: number;
  collectionRate?: number;
  status: CaseStatus;
  stage?: string;
  ageInMonths?: number;
  currency?: string;
  collector?: string;
  collectorName?: string;
  collectorEmail?: string;
  nextAction?: string;
  nextActionDate?: string;
  language?: string;
  notes?: string;
};

export type CaseMessageAuthor = 'Client' | 'Collector' | 'System';

export type CaseMessage = {
  id: string;
  caseId: string;
  author: CaseMessageAuthor;
  createdAt: string;
  body: string;
  read?: boolean;
};


