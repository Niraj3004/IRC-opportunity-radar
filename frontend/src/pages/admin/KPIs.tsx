import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BarChart, Activity, CheckCircle, Clock, Database, Users } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const KPIs = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await api.get('/admin/kpis');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const latestStats = kpis?.latest || {};

  const statCards = [
    { label: 'Total Scraped', value: latestStats.totalScraped || 0, icon: Database, color: 'text-blue-400' },
    { label: 'AI Passed', value: latestStats.aiPassed || 0, icon: CheckCircle, color: 'text-success' },
    { label: 'Human Reviewed', value: latestStats.humanReviewed || 0, icon: Clock, color: 'text-yellow-400' },
    { label: 'Total Users', value: latestStats.totalUsers || 0, icon: Users, color: 'text-primary' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart className="h-6 w-6 text-primary" />
          Key Performance Indicators
        </h1>
        <p className="text-gray-400">System health and processing metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="bg-surface border-gray-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</h3>
                </div>
                <div className={`p-2 bg-gray-800/50 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-white">Historical Data (Last 30 Days)</h2>
        </div>
        <div className="p-6">
          {kpis?.history?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No historical data available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Scraped</th>
                    <th className="pb-3 font-medium text-right">AI Passed</th>
                    <th className="pb-3 font-medium text-right">Human Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {kpis?.history?.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 text-white">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-3 text-right text-gray-400">{row.totalScraped}</td>
                      <td className="py-3 text-right text-gray-400">{row.aiPassed}</td>
                      <td className="py-3 text-right text-gray-400">{row.humanReviewed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
