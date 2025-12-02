/**
 * Node.js script to convert Excel file to JSON
 * Run with: npx tsx src/utils/generateJsonFromExcel.ts
 * or: node --loader ts-node/esm src/utils/generateJsonFromExcel.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
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

const dateFrom = (row: Record<string, unknown>, keys: string[]): string => {
  const val = valueFrom(row, keys);
  if (val == null || val === '') return '';
  
  // Check if it's an Excel serial date number
  const numVal = Number(val);
  if (Number.isFinite(numVal) && numVal > 25569) { // Excel epoch starts at 1900-01-01
    // Convert Excel serial date to JavaScript date
    // Excel counts days since 1900-01-01, but incorrectly treats 1900 as a leap year
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const jsDate = new Date(excelEpoch.getTime() + (numVal - 1) * 24 * 60 * 60 * 1000);
    return jsDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
  
  // Try to parse as regular date string
  try {
    const date = new Date(String(val));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Ignore parse errors
  }
  
  return String(val).trim();
};

function convertExcelToJson(filePath: string): CaseRecord[] {
  try {
    // Read file using Node.js fs
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    console.log(`Parsed ${rows.length} rows from Excel file`);
    if (rows.length > 0) {
      console.log('Available columns:', Object.keys(rows[0]));
    }

    const cases: CaseRecord[] = [];
    const caseIdColumnCandidates = [
      'Case ID', 
      'CaseId', 
      'ID', 
      'CaseID',
      'Debtor number',
      'Debtor ID',
      'Debtor Number',
      'Case Subject'
    ];

    rows.forEach((row, index) => {
      // Try to find Case ID, or generate one from row index + debtor info
      let rawCaseId = valueFrom(row, caseIdColumnCandidates);
      
      // If no Case ID found, try to create one from available data
      if (!rawCaseId) {
        const debtorNumber = valueFrom(row, ['Debtor number', 'Debtor Number']);
        const debtorId = valueFrom(row, ['Debtor ID']);
        const caseSubject = valueFrom(row, ['Case Subject']);
        rawCaseId = debtorNumber || debtorId || caseSubject || `CASE-${index + 1}`;
      }
      
      const caseId = String(rawCaseId ?? '').trim();
      
      if (!caseId) {
        console.warn(`Row ${index + 1}: Skipped - no Case ID found`);
        return;
      }

      // Map all fields from the actual Excel file schema
      const principalAmount = numberFrom(valueFrom(row, ['Amount', 'Principal', 'Principal Amount', 'Amount 2']));
      const interestAmount = numberFrom(valueFrom(row, ['Interest']));
      const feesBeforeSubmission = numberFrom(valueFrom(row, ['Paid before submission', 'Fees Before Submission']));
      const feesAfterSubmission = numberFrom(valueFrom(row, ['Collection fees', 'Administrative fees', 'Fees After Submission']));
      const feesAmount = feesAfterSubmission + numberFrom(valueFrom(row, ['Administrative fees']));
      const totalAmountDue = numberFrom(valueFrom(row, ['Total amount payable', 'Total Amount Due', 'Total Due']));
      const collectedAmount = numberFrom(valueFrom(row, ['Paid', 'Collected', 'Amount Collected']));
      const balanceAmount = numberFrom(valueFrom(row, ['Balance']));
      const collectionRate = totalAmountDue > 0 ? (collectedAmount / totalAmountDue) * 100 : 0;

      const caseRecord: CaseRecord = {
        // Core identifiers
        caseId,
        clientId: 'unknown', // This will be set when importing
        reference: stringFrom(row, ['Case Subject', 'CRM Case ID', 'Reference', 'Client Reference']),

        // Client & Customer info
        clientName: stringFrom(row, ['Customer name', 'Client Name', 'Client'], 'Unknown Client'),
        customerContactName: stringFrom(row, ['Customer contact last name', 'For attention of', 'Customer Contact Name']),
        customerContactEmail: stringFrom(row, ['Customer Contact Email']),
        customerAddress1: stringFrom(row, ['Customer address 1', 'Customer Address 1']),
        customerAddress2: stringFrom(row, ['Customer address 2', 'Customer Address 2']),
        
        // Debtor info
        debtorName: stringFrom(row, ['Debtor name', 'Debtor Name', 'Debtor'], 'Unknown Debtor'),
        debtorAddress1: stringFrom(row, ['Debtor Address 1', 'Debtor address 1']),
        debtorAddress2: stringFrom(row, ['Debtor address 2', 'Debtor Address 2']),
        debtorCity: stringFrom(row, ['Debtor City', 'Debtor city']),
        debtorState: stringFrom(row, ['Debtor State']),
        debtorZip: stringFrom(row, ['Debtor postal code', 'Debtor Zip']),
        debtorCountry: stringFrom(row, ['Debtor country', 'Debtor Country']),
        debtorPhone: stringFrom(row, ['Debtor phone', 'Debtor Phone']),
        debtorEmail: stringFrom(row, ['Debtor email', 'Debtor Email']),
        language: stringFrom(row, ['Language']),
        
        // Dates
        openedDate: dateFrom(row, ['Case entry date', 'Creation Date', 'Created Date', 'Date Opened', 'Opened']),
        dueDate: dateFrom(row, ['Due Date']),
        lastActivityDate: dateFrom(row, ['Close date', 'Last Activity', 'Last Update']),
        lastPaymentDate: dateFrom(row, ['Last Payment Date']),
        
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
        status: normaliseStatus(valueFrom(row, ['Status', 'Case Status', 'Substatus'])),
        stage: stringFrom(row, ['Substatus', 'Stage']),
        ageInMonths: numberFrom(valueFrom(row, ['Age in months', 'Age in Months', 'Age of debt at CMC', 'Age'])),
        
        // Collector info
        collector: stringFrom(row, ['Debt Collector', 'Collector', 'Collector ID']),
        collectorName: stringFrom(row, ['Debt Collector', 'Collector Name']),
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

// Main execution
const excelFilePath = path.join(process.cwd(), 'public', 'Example file Client Portal 2.xls');
const outputPath = path.join(process.cwd(), 'public', 'cases-data.json');

console.log('Converting Excel file to JSON...');
console.log(`Input: ${excelFilePath}`);
console.log(`Output: ${outputPath}`);

try {
  const cases = convertExcelToJson(excelFilePath);
  const jsonContent = JSON.stringify(cases, null, 2);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');
  console.log(`\n✅ Successfully created JSON file with ${cases.length} cases!`);
  console.log(`File saved to: ${outputPath}`);
} catch (error) {
  console.error('\n❌ Error:', error);
  process.exit(1);
}

