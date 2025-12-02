import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { CaseRecord } from '../types/case';

export type ImportResult = {
  updatedCases: CaseRecord[];
  importedCount: number;
};

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

async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
}

async function parseCsvFile(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

export async function importCasesFromFile(
  file: File,
  existingCases: CaseRecord[],
  clientId: string,
  caseIdColumnCandidates: string[] = ['Case ID', 'CaseId', 'ID', 'CaseID'],
): Promise<ImportResult> {
  const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
  const rows = isExcel ? await parseExcelFile(file) : await parseCsvFile(file);

  // Debug: log available columns if no rows found
  if (rows.length === 0) {
    console.warn('No rows found in file. File might be empty or incorrectly formatted.');
  } else {
    console.log(`Parsed ${rows.length} rows from ${isExcel ? 'Excel' : 'CSV'} file`);
    console.log('Available columns:', Object.keys(rows[0] || {}));
  }

  const caseById = new Map<string, CaseRecord>();
  existingCases.forEach((c) => caseById.set(c.caseId, c));

  let importedCount = 0;
  let skippedCount = 0;

  rows.forEach((row) => {
    const rawCaseId = valueFrom(row, caseIdColumnCandidates);
    const caseId = String(rawCaseId ?? '').trim();
    if (!caseId) {
      skippedCount++;
      return;
    }

    const existing = caseById.get(caseId);

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

    const base: CaseRecord = existing ?? {
      caseId,
      clientId,
      clientName: stringFrom(row, ['Client Name', 'Client'], 'Unknown Client'),
      debtorName: stringFrom(row, ['Debtor Name', 'Debtor', 'Customer Contact Name'], 'Unknown Debtor'),
      principalAmount,
      collectedAmount,
      status: normaliseStatus(valueFrom(row, ['Case Status', 'Status'])),
    };

    const updated: CaseRecord = {
      ...base,
      // Core identifiers
      caseId,
      reference: stringFrom(row, ['CRM Case ID', 'Reference', 'Client Reference']) || base.reference,
      
      // Client & Customer info
      clientName: stringFrom(row, ['Client Name', 'Client']) || base.clientName,
      customerContactName: stringFrom(row, ['Customer Contact Name']) || base.customerContactName,
      customerContactEmail: stringFrom(row, ['Customer Contact Email']) || base.customerContactEmail,
      customerAddress1: stringFrom(row, ['Customer Address 1']) || base.customerAddress1,
      customerAddress2: stringFrom(row, ['Customer Address 2']) || base.customerAddress2,
      
      // Debtor info
      debtorName: stringFrom(row, ['Debtor Name', 'Debtor']) || base.debtorName,
      debtorAddress1: stringFrom(row, ['Debtor Address 1']) || base.debtorAddress1,
      debtorAddress2: stringFrom(row, ['Debtor Address 2']) || base.debtorAddress2,
      debtorCity: stringFrom(row, ['Debtor City']) || base.debtorCity,
      debtorState: stringFrom(row, ['Debtor State']) || base.debtorState,
      debtorZip: stringFrom(row, ['Debtor Zip']) || base.debtorZip,
      debtorCountry: stringFrom(row, ['Debtor Country']) || base.debtorCountry,
      debtorPhone: stringFrom(row, ['Debtor Phone']) || base.debtorPhone,
      debtorEmail: stringFrom(row, ['Debtor Email']) || base.debtorEmail,
      language: stringFrom(row, ['Language']) || base.language,
      
      // Dates
      openedDate: stringFrom(row, ['Creation Date', 'Created Date', 'Date Opened', 'Opened']) || base.openedDate,
      dueDate: stringFrom(row, ['Due Date']) || base.dueDate,
      lastActivityDate: stringFrom(row, ['Last Activity', 'Last Update']) || base.lastActivityDate,
      lastPaymentDate: stringFrom(row, ['Last Payment Date']) || base.lastPaymentDate,
      
      // Financial
      principalAmount: principalAmount || base.principalAmount,
      interestAmount: interestAmount || base.interestAmount,
      feesBeforeSubmission: feesBeforeSubmission || base.feesBeforeSubmission,
      feesAfterSubmission: feesAfterSubmission || base.feesAfterSubmission,
      feesAmount: feesAmount || base.feesAmount,
      totalAmountDue: totalAmountDue || base.totalAmountDue || (principalAmount + (interestAmount || 0) + feesAmount),
      collectedAmount: collectedAmount || base.collectedAmount,
      balanceAmount: balanceAmount || base.balanceAmount || (totalAmountDue || (principalAmount + (interestAmount || 0) + feesAmount) - collectedAmount),
      collectionRate: collectionRate || base.collectionRate,
      lastPaymentAmount: numberFrom(valueFrom(row, ['Last Payment Amount'])) || base.lastPaymentAmount,
      currency: stringFrom(row, ['Currency']) || base.currency || 'USD',
      
      // Status & workflow
      status: normaliseStatus(valueFrom(row, ['Case Status', 'Status']) ?? base.status),
      stage: stringFrom(row, ['Stage']) || base.stage,
      ageInMonths: numberFrom(valueFrom(row, ['Age in Months', 'Age'])) || base.ageInMonths,
      
      // Collector info
      collector: stringFrom(row, ['Collector', 'Collector ID']) || base.collector,
      collectorName: stringFrom(row, ['Collector Name']) || base.collectorName,
      collectorEmail: stringFrom(row, ['Collector Email']) || base.collectorEmail,
      
      // Actions
      nextAction: stringFrom(row, ['Next Action']) || base.nextAction,
      nextActionDate: stringFrom(row, ['Next Action Date']) || base.nextActionDate,
      
      // Notes
      notes: stringFrom(row, ['Notes', 'Comments']) || base.notes,
    };

    caseById.set(caseId, updated);
    importedCount += 1;
  });

  const updatedCases = Array.from(caseById.values()).sort((a, b) =>
    a.caseId.localeCompare(b.caseId),
  );

  if (skippedCount > 0) {
    console.warn(`Skipped ${skippedCount} rows without valid Case ID`);
  }

  return { updatedCases, importedCount };
}


