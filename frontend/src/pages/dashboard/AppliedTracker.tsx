import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CheckSquare, ArrowRight, MoreHorizontal } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

const COLUMNS = [
  { id: 'interested', label: 'Interested' },
  { id: 'applying', label: 'Applying' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'won', label: 'Won / Accepted' },
  { id: 'rejected', label: 'Rejected' },
];

export const AppliedTracker = () => {
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['tracker'],
    queryFn: async () => {
      const res = await api.get('/tracker');
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/tracker/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
      setActiveMenu(null);
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
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          Application Tracker
        </h1>
        <p className="text-gray-400">Keep track of the opportunities you are applying for.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
        {COLUMNS.map(col => {
          const colApps = applications?.filter((a: any) => 
            a.status === col.id || (col.id === 'submitted' && a.status === 'applied') // mapping 'applied' to 'submitted' for UI simplicity
          ) || [];
          
          return (
            <div key={col.id} className="min-w-[300px] w-[300px] flex-shrink-0 snap-center bg-surface border border-gray-800 rounded-xl flex flex-col max-h-[75vh]">
              <div className="p-4 border-b border-gray-800 bg-background/50 flex items-center justify-between">
                <h3 className="font-semibold text-white">{col.label}</h3>
                <span className="bg-gray-800 text-gray-400 text-xs py-0.5 px-2 rounded-full">
                  {colApps.length}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colApps.map((app: any) => (
                  <div key={app._id} className="bg-background border border-gray-700 rounded-lg p-4 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {app.opportunityId.type}
                      </Badge>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === app._id ? null : app._id)}
                          className="text-gray-500 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === app._id && (
                          <div className="absolute right-0 top-6 w-40 bg-surface border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                            <div className="text-xs font-medium text-gray-400 px-3 py-2 border-b border-gray-700 bg-background/50">
                              Move to...
                            </div>
                            {COLUMNS.map(c => (
                              <button
                                key={c.id}
                                disabled={c.id === col.id || updateMutation.isPending}
                                onClick={() => updateMutation.mutate({ id: app.opportunityId._id, status: c.id })}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300 flex items-center gap-2"
                              >
                                {c.id !== col.id && <ArrowRight className="h-3 w-3" />}
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <a href={`/opportunity/${app.opportunityId._id}`} className="block font-medium text-white hover:text-primary transition-colors text-sm mb-1 line-clamp-2">
                      {app.opportunityId.title}
                    </a>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {app.opportunityId.organization}
                    </div>
                  </div>
                ))}
                
                {colApps.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-800 rounded-lg">
                    No applications here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
