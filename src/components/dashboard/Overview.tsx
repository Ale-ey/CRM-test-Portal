import { format } from 'date-fns';
import { useMemo } from 'react';
import type { CaseMessage, CaseRecord } from '../../types/case';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowDownToLine, ArrowUpRight, Download, Upload } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

type OverviewProps = {
  cases: CaseRecord[];
  messages: CaseMessage[];
  onImportClick: () => void;
  onExportClick: () => void;
  userName: string;
};

export function Overview({
  cases,
  messages,
  onImportClick,
  onExportClick,
  userName,
}: OverviewProps) {
  const stats = useMemo(() => {
    const totalOutstanding = cases.reduce(
      (acc, c) => acc + (c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount)),
      0,
    );
    const totalCollected = cases.reduce((acc, c) => acc + c.collectedAmount, 0);
    const totalDue = cases.reduce(
      (acc, c) => acc + (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0))),
      0,
    );
    const collectionRate =
      totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

    const byStatus: Record<string, number> = {};
    const byStatusAmount: Record<string, number> = {};
    cases.forEach((c) => {
      const status = c.status;
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      const amount = c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount);
      byStatusAmount[status] = (byStatusAmount[status] ?? 0) + amount;
    });
    
    const chartData = Object.entries(byStatus)
      .map(([status, count]) => ({
        status,
        cases: count,
        amount: byStatusAmount[status] ?? 0,
      }))
      .sort((a, b) => b.cases - a.cases);
    
    const donutData = Object.entries(byStatus).map(([status, count]) => ({
      name: status,
      value: count,
    }));
    
    // Color mapping for status
    const statusColors: Record<string, string> = {
      'Closed': '#10b981', // emerald
      'Paid': '#059669', // emerald-600
      'Open': '#3b82f6', // blue
      'In Progress': '#8b5cf6', // violet
      'On Hold': '#f59e0b', // amber
      'New': '#94a3b8', // slate
    };

    const latestCases = [...cases]
      .sort(
        (a, b) =>
          new Date(b.lastActivityDate ?? b.openedDate ?? '').getTime() -
          new Date(a.lastActivityDate ?? a.openedDate ?? '').getTime(),
      )
      .slice(0, 5);

    const latestMessages = [...messages]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalOutstanding,
      totalCollected,
      collectionRate,
      chartData,
      donutData,
      statusColors,
      latestCases,
      latestMessages,
    };
  }, [cases, messages]);


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Hello, {userName}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, here&apos;s an overview of your collection cases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            type="button"
            onClick={onImportClick}
          >
            <Upload className="h-4 w-4" />
            Import from CRM
          </Button>
          <Button size="sm" className="gap-2" type="button" onClick={onExportClick}>
            <Download className="h-4 w-4" />
            Export data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Total Outstanding</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {formatCurrency(stats.totalOutstanding)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Across {cases.length} active cases
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Total Collected</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {formatCurrency(stats.totalCollected)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Collection rate {stats.collectionRate}% of principal
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Open Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {messages.filter((m) => m.author === 'Client').length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Messages you&apos;ve sent to your collector
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Cases by status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="status" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={0}
                  height={60}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(15,23,42,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                          <p className="text-sm font-semibold text-slate-900">{data.status}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Cases: <span className="font-medium">{data.cases}</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Amount: <span className="font-medium">{formatCurrency(data.amount)}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="cases" 
                  radius={[8, 8, 0, 0]}
                  fill="#10b981"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={stats.statusColors[entry.status] || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
          </CardHeader>
          <CardContent className="relative h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.donutData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ percent }) => {
                    if (percent && percent > 0.05) {
                      return `${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                  labelLine={false}
                >
                  {stats.donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={stats.statusColors[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const total = stats.donutData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((data.value as number) / total * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                          <p className="text-sm font-semibold text-slate-900">{data.name}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Cases: <span className="font-medium">{data.value}</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Percentage: <span className="font-medium">{percent}%</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-2 px-4">
              {stats.donutData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: stats.statusColors[entry.name] || '#94a3b8' }}
                  />
                  <span className="text-[10px] text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>Recent cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.latestCases.map((c) => (
              <div key={c.caseId} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {c.debtorName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Case #{c.caseId} ·{' '}
                    {c.lastActivityDate || c.openedDate
                      ? format(
                          new Date(c.lastActivityDate ?? c.openedDate ?? ''),
                          'd MMM yyyy',
                        )
                      : 'No date'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount),
                      c.currency
                    )}
                  </div>
                  <Badge variant={
                    c.status === 'Paid' || c.status === 'Closed'
                      ? 'success'
                      : c.status === 'Open'
                        ? 'info'
                        : 'outline'
                  }>
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
            {stats.latestCases.length === 0 && (
              <p className="text-xs text-slate-500">No cases yet. Import data to get started.</p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle>Latest messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.latestMessages.map((m) => (
              <div key={m.id} className="space-y-1 rounded-md border border-slate-100 bg-slate-50 p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    Case #{m.caseId} · {m.author}
                  </span>
                  <span className="text-slate-400">
                    {format(new Date(m.createdAt), 'd MMM yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{m.body}</p>
              </div>
            ))}
            {stats.latestMessages.length === 0 && (
              <p className="text-xs text-slate-500">No messages yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


