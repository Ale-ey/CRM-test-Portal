import * as XLSX from 'xlsx';
import type { CaseRecord } from '../types/case';

const numberFrom = (value: unknown): number => {
  if (value == null || value === 'N/A' || value === '') return 0;
  const n = Number(
    String(value)
      .replace(/,/g, '')
      .replace(/£/g, '')
      .replace(/\$/g, '')
      .replace(/%/g, '')
      .trim(),
  );
  return Number.isFinite(n) ? n : 0;
};

const normaliseStatus = (value: unknown): CaseRecord['status'] => {
  const v = String(value ?? '').toLowerCase().trim();
  if (v.includes('paid')) return 'Paid';
  if (v.includes('close')) return 'Closed';
  if (v.includes('hold')) return 'On Hold';
  if (v.includes('progress')) return 'In Progress';
  if (v === 'open' || v.includes('active')) return 'Open';
  if (!v) return 'New';
  return 'New';
};

const valueFrom = (row: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const candidates = Object.keys(row).filter(
      (k) => k.toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, ''),
    );
    if (candidates.length > 0) {
      const val = row[candidates[0]];
      if (val != null && val !== '') return val;
    }
  }
  return undefined;
};

const stringFrom = (row: Record<string, unknown>, keys: string[], fallback = ''): string => {
  const val = valueFrom(row, keys);
  if (val == null || val === '') return fallback;
  return String(val).trim();
};

export function convertExcelToJson(filePath: string): CaseRecord[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    console.log(`Parsed ${rows.length} rows from Excel file`);
    if (rows.length > 0) {
      console.log('Available columns:', Object.keys(rows[0]));
    }

    const cases: CaseRecord[] = [];
    const caseIdColumnCandidates = ['Case ID', 'CaseId', 'ID', 'CaseID'];

    rows.forEach((row, index) => {
      const rawCaseId = valueFrom(row, caseIdColumnCandidates);
      const caseId = String(rawCaseId ?? '').trim();
      
      if (!caseId) {
        console.warn(`Row ${index + 1}: Skipped - no Case ID found`);
        return;
      }

      // Map all fields from the example file schema
      const principalAmount = numberFrom(valueFrom(row, ['Principal', 'Principal Amount']));
      const interestAmount = numberFrom(valueFrom(row, ['Interest']));
      const feesBeforeSubmission = numberFrom(valueFrom(row, ['Fees Before Submission']));
      const feesAfterSubmission = numberFrom(valueFrom(row, ['Fees After Submission']));
      const feesAmount = feesBeforeSubmission + feesAfterSubmission;
      const totalAmountDue = numberFrom(valueFrom(row, ['Total Amount Due', 'Total Due']));
      const collectedAmount = numberFrom(valueFrom(row, ['Paid', 'Collected', 'Amount Collected']));
      const balanceAmount = numberFrom(valueFrom(row, ['Balance']));
      const collectionRate = numberFrom(valueFrom(row, ['Collection Rate']));

      const caseRecord: CaseRecord = {
        // Core identifiers
        caseId,
        clientId: 'unknown', // This will be set when importing
        reference: stringFrom(row, ['CRM Case ID', 'Reference', 'Client Reference']),

        // Client & Customer info
        clientName: stringFrom(row, ['Client Name', 'Client'], 'Unknown Client'),
        customerContactName: stringFrom(row, ['Customer Contact Name']),
        customerContactEmail: stringFrom(row, ['Customer Contact Email']),
        customerAddress1: stringFrom(row, ['Customer Address 1']),
        customerAddress2: stringFrom(row, ['Customer Address 2']),
        
        // Debtor info
        debtorName: stringFrom(row, ['Debtor Name', 'Debtor'], 'Unknown Debtor'),
        debtorAddress1: stringFrom(row, ['Debtor Address 1']),
        debtorAddress2: stringFrom(row, ['Debtor Address 2']),
        debtorCity: stringFrom(row, ['Debtor City']),
        debtorState: stringFrom(row, ['Debtor State']),
        debtorZip: stringFrom(row, ['Debtor Zip']),
        debtorCountry: stringFrom(row, ['Debtor Country']),
        debtorPhone: stringFrom(row, ['Debtor Phone']),
        debtorEmail: stringFrom(row, ['Debtor Email']),
        language: stringFrom(row, ['Language']),
        
        // Dates
        openedDate: stringFrom(row, ['Creation Date', 'Created Date', 'Date Opened', 'Opened']),
        dueDate: stringFrom(row, ['Due Date']),
        lastActivityDate: stringFrom(row, ['Last Activity', 'Last Update']),
        lastPaymentDate: stringFrom(row, ['Last Payment Date']),
        
        // Financial
        principalAmount: principalAmount || 0,
        interestAmount: interestAmount || 0,
        feesBeforeSubmission: feesBeforeSubmission || 0,
        feesAfterSubmission: feesAfterSubmission || 0,
        feesAmount: feesAmount || 0,
        totalAmountDue: totalAmountDue || (principalAmount + interestAmount + feesAmount),
        collectedAmount: collectedAmount || 0,
        balanceAmount: balanceAmount || (totalAmountDue || (principalAmount + interestAmount + feesAmount) - collectedAmount),
        collectionRate: collectionRate || 0,
        lastPaymentAmount: numberFrom(valueFrom(row, ['Last Payment Amount'])),
        currency: stringFrom(row, ['Currency']) || 'USD',
        
        // Status & workflow
        status: normaliseStatus(valueFrom(row, ['Case Status', 'Status'])),
        stage: stringFrom(row, ['Stage']),
        ageInMonths: numberFrom(valueFrom(row, ['Age in Months', 'Age'])),
        
        // Collector info
        collector: stringFrom(row, ['Collector', 'Collector ID']),
        collectorName: stringFrom(row, ['Collector Name']),
        collectorEmail: stringFrom(row, ['Collector Email']),
        
        // Actions
        nextAction: stringFrom(row, ['Next Action']),
        nextActionDate: stringFrom(row, ['Next Action Date']),
        
        // Notes
        notes: stringFrom(row, ['Notes', 'Comments']),
      };

      cases.push(caseRecord);
    });

    console.log(`Successfully converted ${cases.length} cases to JSON`);
    return cases;
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
    throw error;
  }
}

