import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { CaseMessage, CaseRecord } from '../../types/case';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/currency';

type MessagesPageProps = {
  cases: CaseRecord[];
  messages: CaseMessage[];
  onSelectCase: (caseId: string) => void;
};

export function MessagesPage({ cases, messages, onSelectCase }: MessagesPageProps) {
  const [filter, setFilter] = useState<'all' | 'client' | 'collector'>('all');
  const [search, setSearch] = useState('');

  const groupedMessages = useMemo(() => {
    // Group messages by case
    const byCase = new Map<string, { case: CaseRecord; messages: CaseMessage[] }>();

    cases.forEach((c) => {
      const caseMessages = messages.filter((m) => m.caseId === c.caseId);
      if (caseMessages.length > 0) {
        byCase.set(c.caseId, {
          case: c,
          messages: caseMessages.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        });
      }
    });

    return Array.from(byCase.values());
  }, [cases, messages]);

  const filteredMessages = useMemo(() => {
    let filtered = groupedMessages;

    // Filter by author type
    if (filter === 'client') {
      filtered = filtered.map((group) => ({
        ...group,
        messages: group.messages.filter((m) => m.author === 'Client'),
      })).filter((group) => group.messages.length > 0);
    } else if (filter === 'collector') {
      filtered = filtered.map((group) => ({
        ...group,
        messages: group.messages.filter((m) => m.author === 'Collector'),
      })).filter((group) => group.messages.length > 0);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered
        .map((group) => ({
          ...group,
          messages: group.messages.filter(
            (m) =>
              m.body.toLowerCase().includes(searchLower) ||
              group.case.caseId.toLowerCase().includes(searchLower) ||
              group.case.debtorName.toLowerCase().includes(searchLower),
          ),
        }))
        .filter((group) => group.messages.length > 0);
    }

    // Sort by most recent message
    return filtered.sort((a, b) => {
      const aLatest = new Date(a.messages[0]?.createdAt ?? 0).getTime();
      const bLatest = new Date(b.messages[0]?.createdAt ?? 0).getTime();
      return bLatest - aLatest;
    });
  }, [groupedMessages, filter, search]);

  const totalMessages = messages.length;
  const clientMessages = messages.filter((m) => m.author === 'Client').length;
  const collectorMessages = messages.filter((m) => m.author === 'Collector').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all conversations across your cases.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Total: {totalMessages}</span>
          <span>•</span>
          <span>You: {clientMessages}</span>
          <span>•</span>
          <span>Collector: {collectorMessages}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Messages
          </button>
          <button
            type="button"
            onClick={() => setFilter('client')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === 'client'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Your Messages
          </button>
          <button
            type="button"
            onClick={() => setFilter('collector')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === 'collector'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Collector Messages
          </button>
        </div>
        <input
          type="search"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none ring-emerald-500 focus:ring-1 sm:w-64"
        />
      </div>

      {filteredMessages.length === 0 ? (
        <Card className="animate-slide-up">
          <CardContent className="py-12 text-center">
            <div className="text-slate-400 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">No messages found</p>
            <p className="mt-1 text-xs text-slate-500">
              {messages.length === 0
                ? 'Start a conversation by opening a case and sending a message.'
                : 'Try adjusting your filters or search terms.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((group, idx) => (
            <Card
              key={group.case.caseId}
              className="cursor-pointer transition-all hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => onSelectCase(group.case.caseId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">Case #{group.case.caseId}</CardTitle>
                      <Badge
                        variant={
                          group.case.status === 'Paid' || group.case.status === 'Closed'
                            ? 'success'
                            : group.case.status === 'On Hold'
                              ? 'warning'
                              : group.case.status === 'Open'
                                ? 'info'
                                : 'outline'
                        }
                      >
                        {group.case.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{group.case.debtorName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-900">
                      {formatCurrency(
                        group.case.balanceAmount ??
                          (group.case.totalAmountDue ??
                            (group.case.principalAmount +
                              (group.case.interestAmount ?? 0) +
                              (group.case.feesAmount ?? 0)) -
                            group.case.collectedAmount),
                        group.case.currency,
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {group.messages.length} message{group.messages.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {group.messages.slice(0, 3).map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        message.author === 'Client'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-900'
                          : 'border-slate-100 bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium">{message.author}</span>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(message.createdAt), 'd MMM yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="line-clamp-2 whitespace-pre-wrap">{message.body}</p>
                    </div>
                  ))}
                  {group.messages.length > 3 && (
                    <p className="text-[10px] text-slate-400 text-center">
                      +{group.messages.length - 3} more message{group.messages.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(group.case.caseId);
                    }}
                  >
                    View full conversation →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

