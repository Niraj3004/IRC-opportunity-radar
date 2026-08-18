import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TerminalSquare, User } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const AuditLogs = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const logs = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <TerminalSquare className="h-6 w-6 text-primary" />
          Audit Logs
        </h1>
        <p className="text-gray-400">System-wide trail of administrative actions.</p>
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Actor</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Entity Type</th>
                <th className="px-6 py-4 font-medium">Meta / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <User className="h-3 w-3 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs">{log.actorId?.name || 'Unknown'}</div>
                        <div className="text-gray-500 text-[10px]">{log.actorId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="uppercase text-[10px]">{log.action}</Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {log.entityType}
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-[10px] text-gray-400 max-w-xs overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(log.meta || {}, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
