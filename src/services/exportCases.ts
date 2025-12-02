import type { CaseRecord, CaseMessage } from '../types/case';
import Papa from 'papaparse';

export function exportCasesToCsv(cases: CaseRecord[]): string {
  const data = cases.map((c) => ({
    'Case ID': c.caseId,
    'CRM Case ID': c.reference ?? '',
    'Client Name': c.clientName,
    'Customer Contact Name': c.customerContactName ?? '',
    'Customer Contact Email': c.customerContactEmail ?? '',
    'Customer Address 1': c.customerAddress1 ?? '',
    'Customer Address 2': c.customerAddress2 ?? '',
    'Debtor Name': c.debtorName,
    'Debtor Address 1': c.debtorAddress1 ?? '',
    'Debtor Address 2': c.debtorAddress2 ?? '',
    'Debtor City': c.debtorCity ?? '',
    'Debtor State': c.debtorState ?? '',
    'Debtor Zip': c.debtorZip ?? '',
    'Debtor Country': c.debtorCountry ?? '',
    'Debtor Phone': c.debtorPhone ?? '',
    'Debtor Email': c.debtorEmail ?? '',
    'Language': c.language ?? '',
    'Creation Date': c.openedDate ?? '',
    'Due Date': c.dueDate ?? '',
    'Last Activity': c.lastActivityDate ?? '',
    'Last Payment Date': c.lastPaymentDate ?? '',
    'Last Payment Amount': c.lastPaymentAmount ?? 0,
    'Principal': c.principalAmount,
    'Interest': c.interestAmount ?? 0,
    'Fees Before Submission': c.feesBeforeSubmission ?? 0,
    'Fees After Submission': c.feesAfterSubmission ?? 0,
    'Total Amount Due': c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)),
    'Paid': c.collectedAmount,
    'Balance': c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount),
    'Collection Rate': c.collectionRate ?? 0,
    'Case Status': c.status,
    'Stage': c.stage ?? '',
    'Age in Months': c.ageInMonths ?? 0,
    'Currency': c.currency ?? 'USD',
    'Collector': c.collector ?? '',
    'Collector Name': c.collectorName ?? '',
    'Collector Email': c.collectorEmail ?? '',
    'Next Action': c.nextAction ?? '',
    'Next Action Date': c.nextActionDate ?? '',
    'Notes': c.notes ?? '',
  }));
  return Papa.unparse(data);
}

export function exportMessagesToCsv(messages: CaseMessage[]): string {
  const data = messages.map((m) => ({
    'Message ID': m.id,
    'Case ID': m.caseId,
    Author: m.author,
    'Created At': m.createdAt,
    Body: m.body,
  }));
  return Papa.unparse(data);
}


