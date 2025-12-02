import { format } from 'date-fns';
import type { CaseMessage, CaseRecord } from '../../types/case';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

type CaseDetailPanelProps = {
  selectedCase?: CaseRecord;
  messages: CaseMessage[];
  onClose: () => void;
  onSendMessage: (body: string) => void;
};

export function CaseDetailPanel({
  selectedCase,
  messages,
  onClose,
  onSendMessage,
}: CaseDetailPanelProps) {
  const [text, setText] = useState('');

  if (!selectedCase) return null;

  const caseMessages = messages.filter((m) => m.caseId === selectedCase.caseId);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl animate-slide-in-right">
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Case details
          </div>
          <div className="text-sm font-semibold text-slate-900">
            #{selectedCase.caseId} · {selectedCase.debtorName}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-xs"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      <div className="flex h-[calc(100%-3.5rem)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  selectedCase.status === 'Paid' || selectedCase.status === 'Closed'
                    ? 'success'
                    : selectedCase.status === 'On Hold'
                      ? 'warning'
                      : selectedCase.status === 'Open'
                        ? 'info'
                        : 'outline'
                }
              >
                {selectedCase.status}
              </Badge>
              <div className="text-[11px] text-slate-500">
                Opened{' '}
                {selectedCase.openedDate
                  ? format(new Date(selectedCase.openedDate), 'd MMM yyyy')
                  : 'N/A'}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-slate-500">Outstanding</div>
                <div className="font-semibold text-slate-900">
                  {formatCurrency(selectedCase.balanceAmount ?? (selectedCase.totalAmountDue ?? (selectedCase.principalAmount + (selectedCase.interestAmount ?? 0) + (selectedCase.feesAmount ?? 0)) - selectedCase.collectedAmount), selectedCase.currency)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Collected</div>
                <div className="font-semibold text-slate-900">
                  {formatCurrency(selectedCase.collectedAmount, selectedCase.currency)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Total Due</div>
                <div className="font-medium text-slate-900">
                  {formatCurrency(selectedCase.totalAmountDue ?? (selectedCase.principalAmount + (selectedCase.interestAmount ?? 0) + (selectedCase.feesAmount ?? 0)), selectedCase.currency)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Collection Rate</div>
                <div className="font-medium text-slate-900">
                  {selectedCase.collectionRate?.toFixed(1) ?? ((selectedCase.collectedAmount / (selectedCase.totalAmountDue ?? (selectedCase.principalAmount + (selectedCase.interestAmount ?? 0) + (selectedCase.feesAmount ?? 0)))) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-slate-500">Client</div>
                <div className="font-medium text-slate-900">
                  {selectedCase.clientName}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Collector</div>
                <div className="font-medium text-slate-900">
                  {selectedCase.collectorName ?? selectedCase.collector ?? 'Not assigned'}
                </div>
              </div>
              {selectedCase.dueDate && (
                <div>
                  <div className="text-slate-500">Due Date</div>
                  <div className="font-medium text-slate-900">
                    {format(new Date(selectedCase.dueDate), 'd MMM yyyy')}
                  </div>
                </div>
              )}
              {selectedCase.stage && (
                <div>
                  <div className="text-slate-500">Stage</div>
                  <div className="font-medium text-slate-900">
                    {selectedCase.stage}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Messages &amp; updates
            </div>
            <div className="space-y-2">
              {caseMessages.length === 0 && (
                <p className="text-xs text-slate-500">
                  No messages yet. Use the form below to ask a question or send an update to
                  your collector.
                </p>
              )}
              {caseMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2 text-xs ${
                    m.author === 'Client' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.author !== 'Client' && (
                    <div className="mt-1 h-6 w-6 rounded-full bg-slate-200" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg border px-3 py-2 ${
                      m.author === 'Client'
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-900'
                        : 'border-slate-100 bg-white text-slate-800'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span>{m.author}</span>
                      <span>{format(new Date(m.createdAt), 'd MMM yyyy HH:mm')}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                  {m.author === 'Client' && (
                    <div className="mt-1 h-6 w-6 rounded-full bg-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-100 bg-slate-50 px-4 py-3"
        >
          <label className="mb-1 block text-[11px] font-medium text-slate-600">
            Ask a question / send an update
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-emerald-500 focus:ring-1"
            placeholder="Type your message for the collector..."
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              Messages are linked to this case and stay when you re-import from your CRM.
            </p>
            <Button size="sm" type="submit" className="gap-1">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


