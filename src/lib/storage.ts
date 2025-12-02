import type { CaseRecord, CaseMessage } from '../types/case';

const CASES_KEY = 'clientPortal.cases.v2';
const MESSAGES_KEY = 'clientPortal.messages.v2';

export type PersistedState = {
  cases: CaseRecord[];
  messages: CaseMessage[];
};

// Load all cases (for admin) or filter by clientId
export function loadState(clientId?: string): PersistedState {
  if (typeof window === 'undefined') {
    return { cases: [], messages: [] };
  }

  try {
    const rawCases = window.localStorage.getItem(CASES_KEY);
    const rawMessages = window.localStorage.getItem(MESSAGES_KEY);

    const allCases: CaseRecord[] = rawCases ? JSON.parse(rawCases) : [];
    const allMessages: CaseMessage[] = rawMessages ? JSON.parse(rawMessages) : [];

    // If clientId is provided, filter to only that client's data
    if (clientId) {
      const clientCases = allCases.filter((c) => c.clientId === clientId);
      const clientCaseIds = new Set(clientCases.map((c) => c.caseId));
      const clientMessages = allMessages.filter((m) => clientCaseIds.has(m.caseId));

      return {
        cases: clientCases,
        messages: clientMessages,
      };
    }

    // Admin or no filter: return all data
    return {
      cases: allCases,
      messages: allMessages,
    };
  } catch {
    return { cases: [], messages: [] };
  }
}

export function saveCases(cases: CaseRecord[], clientId?: string) {
  if (typeof window === 'undefined') return;

  // If clientId is provided, merge with existing cases from other clients
  if (clientId) {
    const rawCases = window.localStorage.getItem(CASES_KEY);
    const allCases: CaseRecord[] = rawCases ? JSON.parse(rawCases) : [];

    // Remove old cases for this client
    const otherClientCases = allCases.filter((c) => c.clientId !== clientId);

    // Add updated cases for this client
    const updatedCases = [...otherClientCases, ...cases];

    window.localStorage.setItem(CASES_KEY, JSON.stringify(updatedCases));
  } else {
    // Admin or no filter: save all cases directly
    window.localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  }
}

export function saveMessages(messages: CaseMessage[], clientId?: string) {
  if (typeof window === 'undefined') return;

  // If clientId is provided, merge with existing messages from other clients
  if (clientId) {
    const rawCases = window.localStorage.getItem(CASES_KEY);
    const rawMessages = window.localStorage.getItem(MESSAGES_KEY);

    const allCases: CaseRecord[] = rawCases ? JSON.parse(rawCases) : [];
    const allMessages: CaseMessage[] = rawMessages ? JSON.parse(rawMessages) : [];

    // Get case IDs for this client
    const clientCaseIds = new Set(
      allCases.filter((c) => c.clientId === clientId).map((c) => c.caseId)
    );

    // Remove old messages for this client's cases
    const otherClientMessages = allMessages.filter((m) => !clientCaseIds.has(m.caseId));

    // Add updated messages for this client
    const updatedMessages = [...otherClientMessages, ...messages];

    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
  } else {
    // Admin or no filter: save all messages directly
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }
}


