import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Database, Plus, RefreshCw, Trash2, ExternalLink, Beaker, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const Sources = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [newSource, setNewSource] = useState({ name: '', url: '', type: 'rss' });

  const { data: sources, isLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: async () => {
      const res = await api.get('/admin/sources');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/admin/sources', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
      setIsAdding(false);
      setNewSource({ name: '', url: '', type: 'rss' });
    }
  });

  const fetchMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/sources/${id}/fetch`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Sources Management
          </h1>
          <p className="text-gray-400">Configure data ingestion endpoints for the AI agent.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {isAdding && (
        <div className="bg-surface border border-gray-800 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Source Name</label>
            <input 
              type="text" 
              value={newSource.name}
              onChange={e => setNewSource({...newSource, name: e.target.value})}
              className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2"
              placeholder="e.g. ReliefWeb RSS"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
            <input 
              type="url" 
              value={newSource.url}
              onChange={e => setNewSource({...newSource, url: e.target.value})}
              className="w-full bg-background border border-gray-700 text-sm text-white rounded-lg px-3 py-2"
              placeholder="https://..."
            />
          </div>
          <div className="w-32">
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
          <Button 
            onClick={() => createMutation.mutate(newSource)}
            disabled={!newSource.name || !newSource.url || createMutation.isPending}
            className="w-full md:w-auto"
          >
            Save
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources?.map((source: any) => (
          <div key={source._id} className="bg-surface border border-gray-800 rounded-xl p-5 relative group flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="outline" className="uppercase text-[10px]">{source.type}</Badge>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => testFetchMutation.mutate(source._id)}
                  disabled={testFetchMutation.isPending}
                  className="text-gray-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Test Fetch Preview"
                >
                  <Beaker className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => fetchMutation.mutate(source._id)}
                  disabled={fetchMutation.isPending}
                  className="text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                  title="Force Fetch Now"
                >
                  <RefreshCw className={`h-4 w-4 ${fetchMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(source._id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete Source"
                >
                  <Trash2 className="h-4 w-4" />
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
                Status: <span className={source.status === 'active' ? 'text-success' : 'text-yellow-500'}>{source.status}</span>
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
    </div>
  );
};
