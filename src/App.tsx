
import { useEffect, useRef, useState } from 'react';
import type { CaseMessage, CaseRecord } from './types/case';
import { loadState, saveCases, saveMessages } from './lib/storage';
import { Sidebar } from './components/layout/Sidebar';
import { Overview } from './components/dashboard/Overview';
import { CasesTable } from './components/dashboard/CasesTable';
import { CaseDetailPanel } from './components/dashboard/CaseDetailPanel';
import { importCasesFromFile } from './services/importCases';
import { exportCasesToCsv, exportMessagesToCsv } from './services/exportCases';
import { LoginPage } from './components/auth/LoginPage';
import { getAuthState, login, logout } from './services/authService';
import type { User } from './types/auth';
import { ReportsPage } from './components/dashboard/ReportsPage';
import { MessagesPage } from './components/dashboard/MessagesPage';
import { SettingsPage } from './components/dashboard/SettingsPage';

type Tab = 'overview' | 'cases' | 'reports' | 'messages' | 'settings';

const App = () => {
  const [user, setUser] = useState<User | null>(() => getAuthState().user);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [{ cases, messages }, setState] = useState(() =>
    user ? loadState(user.id) : { cases: [], messages: [] }
  );
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load example JSON file on first mount if no cases exist
  useEffect(() => {
    const loadExampleData = async () => {
      if (!user) return;

      // Only load if there are no cases in localStorage
      const initialState = loadState(user.id);
      if (initialState.cases.length > 0) {
        console.log(`Found ${initialState.cases.length} cases in localStorage`);
        return;
      }

      setIsLoadingExample(true);
      try {
        // Try to fetch the JSON file from public folder
        const response = await fetch('/cases-data.json');
        if (!response.ok) {
          console.log('JSON data file not found, skipping auto-load');
          setIsLoadingExample(false);
          return;
        }

        const casesData: CaseRecord[] = await response.json();
        // Associate cases with the logged-in user
        const casesWithClientId = casesData.map((c) => ({ ...c, clientId: user.id }));
        if (casesWithClientId.length > 0) {
          setState((prev) => ({ ...prev, cases: casesWithClientId }));
          setSelectedCaseId(casesWithClientId[0].caseId);
          console.log(`✅ Loaded ${casesWithClientId.length} cases from JSON file`);
        }
      } catch (error) {
        console.error('Failed to load example data:', error);
      } finally {
        setIsLoadingExample(false);
      }
    };

    loadExampleData();
  }, [user]); // Reload when user changes

  const handleLoadFromJson = async () => {
    if (!user) return;

    setIsLoadingExample(true);
    try {
      const response = await fetch('/cases-data.json');
      if (!response.ok) {
        alert('JSON data file not found');
        return;
      }

      const casesData: CaseRecord[] = await response.json();
      // Associate cases with the logged-in user
      const casesWithClientId = casesData.map((c) => ({ ...c, clientId: user.id }));
      if (casesWithClientId.length > 0) {
        setState((prev) => ({ ...prev, cases: casesWithClientId }));
        if (!selectedCaseId && casesWithClientId.length > 0) {
          setSelectedCaseId(casesWithClientId[0].caseId);
        }
        console.log(`✅ Reloaded ${casesWithClientId.length} cases from JSON file`);
      }
    } catch (error) {
      console.error('Failed to load JSON data:', error);
      alert('Failed to load data from JSON file');
    } finally {
      setIsLoadingExample(false);
    }
  };

  useEffect(() => {
    if (user) {
      saveCases(cases, user.id);
    }
  }, [cases, user]);

  useEffect(() => {
    if (user) {
      saveMessages(messages, user.id);
    }
  }, [messages, user]);

  const selectedCase: CaseRecord | undefined = cases.find(
    (c) => c.caseId === selectedCaseId,
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    try {
      const result = await importCasesFromFile(file, cases, user.id);
      setState((prev) => ({ ...prev, cases: result.updatedCases }));
      if (!selectedCaseId && result.updatedCases.length > 0) {
        setSelectedCaseId(result.updatedCases[0].caseId);
      }
    } finally {
      event.target.value = '';
    }
  };

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportClick = () => {
    const casesCsv = exportCasesToCsv(cases);
    download(casesCsv, 'cases.csv');
  };

  const handleSendMessage = (body: string) => {
    if (!selectedCase) return;
    const now = new Date().toISOString();
    const newMessage: CaseMessage = {
      id: `${selectedCase.caseId}-${now}`,
      caseId: selectedCase.caseId,
      author: 'Client',
      createdAt: now,
      body,
    };
    setState((prev) => ({ ...prev, messages: [...prev.messages, newMessage] }));
  };

  const handleLogin = (email: string, password: string) => {
    const loggedInUser = login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      setLoginError(undefined);
      // Load user's data
      const userData = loadState(loggedInUser.id);
      setState(userData);
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setState({ cases: [], messages: [] });
    setSelectedCaseId(undefined);
    setActiveTab('overview');
  };

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">
      <Sidebar active={activeTab} onChange={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {isLoadingExample && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center animate-fade-in">
              <div className="mb-2 text-sm text-slate-600">Loading example data...</div>
              <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-full animate-pulse bg-emerald-500" />
              </div>
            </div>
          </div>
        )}
        {!isLoadingExample && (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-6 animate-fade-in">
          {activeTab === 'overview' && (
            <Overview
              cases={cases}
              messages={messages}
              onImportClick={handleImportClick}
              onExportClick={handleExportClick}
              userName={user.name}
            />
          )}

          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  Cases
                </h1>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Import from CRM
                </button>
              </div>
              <CasesTable
                cases={cases}
                onSelectCase={(id) => {
                  setSelectedCaseId(id);
                }}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsPage cases={cases} messages={messages} />
          )}

          {activeTab === 'messages' && (
            <MessagesPage 
              cases={cases} 
              messages={messages} 
              onSelectCase={(id) => setSelectedCaseId(id)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              user={user}
              cases={cases}
              messages={messages}
              onLoadFromJson={handleLoadFromJson}
              onExportMessages={() => {
                const messagesCsv = exportMessagesToCsv(messages);
                download(messagesCsv, 'messages.csv');
              }}
              onExportCases={handleExportClick}
            />
          )}
          </div>
        </div>
        )}
      </main>

      <CaseDetailPanel
        selectedCase={selectedCase}
        messages={messages}
        onClose={() => setSelectedCaseId(undefined)}
        onSendMessage={handleSendMessage}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default App;