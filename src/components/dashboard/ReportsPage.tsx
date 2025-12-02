import { useMemo } from 'react';
import { format } from 'date-fns';
import type { CaseMessage, CaseRecord } from '../../types/case';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
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
  Line,
  LineChart,
} from 'recharts';

type ReportsPageProps = {
  cases: CaseRecord[];
  messages: CaseMessage[];
};

export function ReportsPage({ cases, messages }: ReportsPageProps) {
  const reports = useMemo(() => {
    // Cases by age
    const byAge: Record<string, number> = {};
    const byAgeAmount: Record<string, number> = {};
    cases.forEach((c) => {
      const age = c.ageInMonths ?? 0;
      const ageGroup = age < 3 ? '0-3 months' : age < 6 ? '3-6 months' : age < 12 ? '6-12 months' : '12+ months';
      byAge[ageGroup] = (byAge[ageGroup] ?? 0) + 1;
      const amount = c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount);
      byAgeAmount[ageGroup] = (byAgeAmount[ageGroup] ?? 0) + amount;
    });

    // Cases by collector
    const byCollector: Record<string, { count: number; collected: number; outstanding: number }> = {};
    cases.forEach((c) => {
      const collector = c.collectorName ?? c.collector ?? 'Unassigned';
      if (!byCollector[collector]) {
        byCollector[collector] = { count: 0, collected: 0, outstanding: 0 };
      }
      byCollector[collector].count += 1;
      byCollector[collector].collected += c.collectedAmount;
      const outstanding = c.balanceAmount ?? (c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0)) - c.collectedAmount);
      byCollector[collector].outstanding += outstanding;
    });

    // Collection trend (by month)
    const byMonth: Record<string, { collected: number; cases: number }> = {};
    cases.forEach((c) => {
      if (c.lastPaymentDate) {
        const date = new Date(c.lastPaymentDate);
        const monthKey = format(date, 'MMM yyyy');
        if (!byMonth[monthKey]) {
          byMonth[monthKey] = { collected: 0, cases: 0 };
        }
        byMonth[monthKey].collected += c.collectedAmount;
        byMonth[monthKey].cases += 1;
      }
    });

    // Status distribution
    const byStatus: Record<string, number> = {};
    cases.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    });

    const ageData = Object.entries(byAge).map(([age, count]) => ({
      age,
      cases: count,
      amount: byAgeAmount[age] ?? 0,
    }));

    const collectorData = Object.entries(byCollector)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        cases: data.count,
        collected: data.collected,
        outstanding: data.outstanding,
        rate: data.outstanding > 0 ? ((data.collected / (data.collected + data.outstanding)) * 100) : 0,
      }))
      .sort((a, b) => b.collected - a.collected);

    const trendData = Object.entries(byMonth)
      .map(([month, data]) => ({
        month,
        collected: data.collected,
        cases: data.cases,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    const statusData = Object.entries(byStatus).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    const statusColors: Record<string, string> = {
      'Closed': '#10b981',
      'Paid': '#059669',
      'Open': '#3b82f6',
      'In Progress': '#8b5cf6',
      'On Hold': '#f59e0b',
      'New': '#94a3b8',
    };

    return {
      ageData,
      collectorData,
      trendData,
      statusData,
      statusColors,
    };
  }, [cases]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Detailed insights into your collection cases and performance metrics.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle>Cases by Age</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.ageData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="age"
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
                          <p className="text-sm font-semibold text-slate-900">{data.age}</p>
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
                <Bar dataKey="cases" radius={[8, 8, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15,23,42,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                          <p className="text-sm font-semibold text-slate-900">{data.month}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Collected: <span className="font-medium">{formatCurrency(data.collected)}</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Cases: <span className="font-medium">{data.cases}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>Collector Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Collector</th>
                  <th className="px-4 py-3 font-medium text-right">Cases</th>
                  <th className="px-4 py-3 font-medium text-right">Collected</th>
                  <th className="px-4 py-3 font-medium text-right">Outstanding</th>
                  <th className="px-4 py-3 font-medium text-right">Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {reports.collectorData.map((collector, idx) => (
                  <tr
                    key={collector.fullName}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{collector.fullName}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{collector.cases}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(collector.collected)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(collector.outstanding)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={collector.rate > 50 ? 'success' : collector.rate > 25 ? 'info' : 'outline'}>
                        {collector.rate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
                {reports.collectorData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                      No collector data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reports.statusData}
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
                  {reports.statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={reports.statusColors[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const total = reports.statusData.reduce((sum, item) => sum + item.value, 0);
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {reports.statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: reports.statusColors[entry.name] || '#94a3b8' }}
                  />
                  <span className="text-[10px] text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Total Cases</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{cases.length}</div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Active Cases</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {cases.filter((c) => c.status !== 'Closed' && c.status !== 'Paid').length}
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Total Messages</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{messages.length}</div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">Open Questions</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {messages.filter((m) => m.author === 'Client').length}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="text-xs text-emerald-600 font-medium">Average Collection Rate</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-700">
                {cases.length > 0
                  ? (
                      (cases.reduce((acc, c) => {
                        const total = c.totalAmountDue ?? (c.principalAmount + (c.interestAmount ?? 0) + (c.feesAmount ?? 0));
                        return total > 0 ? acc + (c.collectedAmount / total) * 100 : acc;
                      }, 0) / cases.length)
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

