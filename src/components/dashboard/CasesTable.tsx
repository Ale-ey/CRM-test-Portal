import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { CaseRecord } from '../../types/case';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../utils/currency';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CasesTableProps = {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
};

const ITEMS_PER_PAGE = 10;

export function CasesTable({ cases, onSelectCase }: CasesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        !search ||
        c.caseId.toLowerCase().includes(search.toLowerCase()) ||
        c.debtorName.toLowerCase().includes(search.toLowerCase()) ||
        c.clientName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cases, search, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCases = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Cases</CardTitle>
        <div className="flex w-full flex-col gap-2 text-xs sm:w-auto sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none ring-emerald-500 focus:ring-1 sm:w-52"
          />
          <select
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-emerald-500 focus:ring-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In progress</option>
            <option value="On Hold">On hold</option>
            <option value="Closed">Closed</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Case ID</th>
                <th className="px-4 py-3 font-medium">Debtor</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium text-right">Outstanding</th>
                <th className="px-4 py-3 font-medium text-right">Collected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Collector</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.map((c, idx) => (
                <tr
                  key={c.caseId}
                  className={`cursor-pointer border-b border-slate-50 text-[11px] transition-all hover:bg-slate-50 hover:shadow-sm ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : ''
                  }`}
                  onClick={() => onSelectCase(c.caseId)}
                  style={{ animationDelay: `${idx * 0.02}s` }}
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-900">
                    {c.caseId}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.debtorName}</div>
                    {c.debtorEmail && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{c.debtorEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.clientName}</div>
                    {c.customerContactName && (
                      <div className="text-[10px] text-slate-500">{c.customerContactName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(
                        c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount),
                        c.currency
                      )}
                    </div>
                    {c.totalAmountDue && (
                      <div className="text-[10px] text-slate-500">
                        Total: {formatCurrency(c.totalAmountDue, c.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-emerald-600">
                      {formatCurrency(c.collectedAmount, c.currency)}
                    </div>
                    {c.collectionRate !== undefined && c.collectionRate > 0 && (
                      <div className="text-[10px] text-slate-500">
                        {c.collectionRate.toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === 'Paid' || c.status === 'Closed'
                          ? 'success'
                          : c.status === 'On Hold'
                            ? 'warning'
                            : c.status === 'Open'
                              ? 'info'
                              : 'outline'
                      }
                    >
                      {c.status}
                    </Badge>
                    {c.stage && (
                      <div className="text-[10px] text-slate-500 mt-1">{c.stage}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{c.collectorName ?? c.collector ?? '-'}</div>
                    {c.collectorEmail && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.collectorEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {c.openedDate ? (
                      <div className="text-[10px]">
                        <div>Opened: {format(new Date(c.openedDate), 'MMM d, yyyy')}</div>
                        {c.lastActivityDate && (
                          <div className="mt-1">Updated: {format(new Date(c.lastActivityDate), 'MMM d, yyyy')}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedCases.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-xs text-slate-500"
                  >
                    No cases found. {cases.length === 0 ? 'Import from your CRM to see data.' : 'Try adjusting your search or filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <div className="text-xs text-slate-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} cases
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    // Add ellipsis if there's a gap
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-xs text-slate-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium transition-all ${
                            currentPage === page
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


