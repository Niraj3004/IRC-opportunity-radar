import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Database, Plus, RefreshCw, Trash2, ExternalLink, Beaker, X, Power, Edit, History } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const Sources = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [viewingLogsFor, setViewingLogsFor] = useState<string | null>(null);
  const [newSource, setNewSource] = useState({ name: '', url: '', type: 'rss', status: 'active', fetchFrequency: '0 0 * * *' });

  // Fetch Sources
  const { data: sources, isLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: async () => {
      const res = await api.get('/admin/sources');
      return res.data.data;
    },
  });

  // Fetch Logs
  const { data: sourceLogs } = useQuery({
    queryKey: ['admin-source-logs', viewingLogsFor],
    queryFn: async () => {
      if (!viewingLogsFor) return [];
      const res = await api.get(`/admin/sources/${viewingLogsFor}/logs`);
      return res.data.data.items;
    },
    enabled: !!viewingLogsFor
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/admin/sources', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      setIsAdding(false);
      setNewSource({ name: '', url: '', type: 'rss', status: 'active', fetchFrequency: '0 0 * * *' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.patch(`/admin/sources/${data.id}`, data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      setEditingSourceId(null);
      setNewSource({ name: '', url: '', type: 'rss', status: 'active', fetchFrequency: '0 0 * * *' });
      setIsAdding(false);
    }
  });

  const testFetchMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/sources/${id}/test`);
      return res.data;
    },
    onSuccess: (data) => {
      setTestResult(data);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Test fetch failed');
    }
  });

  const fetchMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/sources/${id}/fetch`);
    },
    onSuccess: () => {
      alert("Fetch job triggered successfully!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if(window.confirm('Are you sure you want to delete this source?')) {
        await api.delete(`/admin/sources/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
    }
  });

  const handleEdit = (source: any) => {
    setIsAdding(true);
    setEditingSourceId(source._id);
    setNewSource({
      name: source.name,
      url: source.url,
      type: source.type,
      status: source.status || 'active',
      fetchFrequency: source.fetchFrequency || '0 0 * * *'
    });
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingSourceId(null);
    setNewSource({ name: '', url: '', type: 'rss', status: 'active', fetchFrequency: '0 0 * * *' });
  };

  const handleSubmit = () => {
    if (editingSourceId) {
      updateMutation.mutate({ id: editingSourceId, payload: newSource });
    } else {
      createMutation.mutate(newSource);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Sources Management
          </h1>
          <p className="text-gray-400">Configure data ingestion endpoints for the AI agent.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-surface border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-white font-medium mb-4">{editingSourceId ? 'Edit Source' : 'New Source'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Source Name</label>
              <input 
                type="text" 
                value={newSource.name}
                onChange={e => setNewSource({...newSource, name: e.target.value})}
                className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2"
                placeholder="e.g. ReliefWeb RSS"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
              <input 
                type="url" 
                value={newSource.url}
                onChange={e => setNewSource({...newSource, url: e.target.value})}
                className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
              <select 
                value={newSource.type}
                onChange={e => setNewSource({...newSource, type: e.target.value})}
                className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2 outline-none"
              >
                <option value="rss">RSS</option>
                <option value="api">API</option>
                <option value="webpage">Webpage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Fetch Frequency (Cron)</label>
              <input 
                type="text" 
                value={newSource.fetchFrequency}
                onChange={e => setNewSource({...newSource, fetchFrequency: e.target.value})}
                className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2"
                placeholder="0 0 * * *"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelForm}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!newSource.name || !newSource.url || createMutation.isPending || updateMutation.isPending}
            >
              {editingSourceId ? 'Save Changes' : 'Create Source'}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources?.map((source: any) => (
          <div key={source._id} className="bg-surface border border-gray-800 rounded-xl p-5 relative group flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase text-[10px]">{source.type}</Badge>
                {source.status === 'active' 
                  ? <span className="h-2 w-2 rounded-full bg-success"></span>
                  : <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                }
              </div>
              
              <div className="flex gap-2 bg-background p-1 rounded-md border border-gray-800 opacity-50 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => updateMutation.mutate({ id: source._id, payload: { status: source.status === 'active' ? 'inactive' : 'active' }})}
                  className={`${source.status === 'active' ? 'text-success' : 'text-gray-500'} hover:text-white transition-colors`}
                  title={source.status === 'active' ? 'Disable Source' : 'Enable Source'}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleEdit(source)}
                  className="text-gray-500 hover:text-white transition-colors"
                  title="Edit Source"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => testFetchMutation.mutate(source._id)}
                  disabled={testFetchMutation.isPending}
                  className="text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Test Fetch Preview"
                >
                  <Beaker className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => fetchMutation.mutate(source._id)}
                  disabled={fetchMutation.isPending}
                  className="text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                  title="Force Fetch Now"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${fetchMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setViewingLogsFor(source._id)}
                  className="text-gray-500 hover:text-white transition-colors"
                  title="View Fetch Logs"
                >
                  <History className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(source._id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete Source"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <h3 className="font-semibold text-white mb-1">{source.name}</h3>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1 mb-4 truncate"
            >
              {source.url} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
            
            <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-500">
                Status: <span className={source.status === 'active' ? 'text-success' : 'text-gray-500'}>{source.status}</span>
              </span>
              <span className="text-gray-500">
                Freq: {source.fetchFrequency}
              </span>
            </div>
            
            {source.lastFetch && (
              <div className="mt-2 text-[10px] text-gray-600">
                Last fetch: {new Date(source.lastFetch).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Test Fetch Modal */}
      {testResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-gray-800 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Beaker className="h-5 w-5 text-blue-400" />
                Test Fetch Preview
              </h3>
              <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {viewingLogsFor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-gray-800 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-gray-400" />
                Source Execution Logs
              </h3>
              <button onClick={() => setViewingLogsFor(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {sourceLogs?.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No logs found for this source.</div>
              ) : (
                <div className="space-y-4">
                  {sourceLogs?.map((log: any) => (
                    <div key={log._id} className="bg-background border border-gray-800 p-3 rounded-lg text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">{new Date(log.startTime).toLocaleString()}</span>
                        <Badge variant={log.status === 'success' ? 'success' : 'outline'}>{log.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div className="bg-surface p-2 rounded text-center text-gray-300"><span className="text-white block font-bold text-sm">{log.itemsFound}</span>Found</div>
                        <div className="bg-surface p-2 rounded text-center text-gray-300"><span className="text-white block font-bold text-sm">{log.itemsAdded}</span>Added</div>
                        <div className="bg-surface p-2 rounded text-center text-gray-300"><span className="text-white block font-bold text-sm">{log.itemsFailed}</span>Failed</div>
                      </div>
                      {log.error && <div className="text-red-400 text-xs mt-2 bg-red-900/10 p-2 rounded">{log.error}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
