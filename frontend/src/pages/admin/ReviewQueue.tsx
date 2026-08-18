import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ExternalLink, CheckCircle, XCircle, Search, LayoutList, Database } from 'lucide-react';

export const ReviewQueue = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);

  // Form State for editing
  const [editFields, setEditFields] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', page],
    queryFn: async () => {
      const res = await api.get(`/reviews?page=${page}&limit=20`);
      return res.data.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ action, fields }: { action: 'approve' | 'reject', fields?: any }) => {
      await api.patch(`/reviews/${selectedOpp._id}`, { action, fields });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSelectedOpp(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to process review action');
    }
  });

  const openReviewModal = (opp: any) => {
    setSelectedOpp(opp);
    setEditFields({
      title: opp.title,
      type: opp.type,
      organization: opp.organization || '',
      url: opp.url,
      applyUrl: opp.applyUrl || '',
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '', // for html date input
      tags: opp.tags ? opp.tags.join(', ') : '',
      description: opp.description || '',
    });
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tags back into array
    const parsedTags = editFields.tags 
      ? editFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    reviewMutation.mutate({ 
      action: 'approve', 
      fields: {
        ...editFields,
        tags: parsedTags,
        deadline: editFields.deadline ? new Date(editFields.deadline).toISOString() : undefined
      }
    });
  };

  const handleReject = () => {
    if (confirm('Are you sure you want to reject and permanently archive this opportunity?')) {
      reviewMutation.mutate({ action: 'reject' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Review Queue</h1>
        <p className="text-gray-400">Human-in-the-loop review for AI-extracted opportunities.</p>
      </div>

      <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle className="mx-auto h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-medium text-white">Queue is empty!</h3>
            <p className="text-gray-400 mt-1">All AI extractions have been reviewed.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Confidence</th>
                    <th className="px-6 py-4 font-medium">Scraped Date</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data?.items?.map((opp: any) => (
                    <tr key={opp._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white line-clamp-1">{opp.title}</div>
                        {opp.organization && (
                          <div className="text-gray-500 text-xs mt-0.5">{opp.organization}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="uppercase text-[10px]">{opp.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          opp.confidence > 0.8 ? 'bg-success/10 text-success' : 
                          opp.confidence > 0.5 ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {Math.round(opp.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(opp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" onClick={() => openReviewModal(opp)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-background/50">
                <span className="text-sm text-gray-400">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" size="sm" 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" size="sm" 
                    disabled={page >= data.pagination.totalPages} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Side-by-Side Review Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex w-full max-w-7xl h-[90vh] bg-surface rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
            
            {/* Left Pane: Raw Extraction Context */}
            <div className="w-1/2 border-r border-gray-800 flex flex-col bg-background/50">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-surface">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Raw Source Context
                </h3>
                <a href={selectedOpp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  Visit Original Source <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Confidence Score</div>
                  <div className="text-xl font-bold text-white">{(selectedOpp.confidence * 100).toFixed(1)}%</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Raw JSON Extract</div>
                  <pre className="text-xs text-green-400 bg-[#0d1117] p-4 rounded-lg overflow-x-auto font-mono">
                    {JSON.stringify(selectedOpp.rawExtract || selectedOpp, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Pane: Editable Form */}
            <div className="w-1/2 flex flex-col bg-surface">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-surface">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <LayoutList className="h-4 w-4 text-success" />
                  Edit & Publish
                </h3>
                <button onClick={() => setSelectedOpp(null)} className="text-gray-400 hover:text-white p-1">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form id="reviewForm" onSubmit={handleApprove} className="flex-1 overflow-auto p-6 space-y-4">
                <Input
                  label="Title"
                  value={editFields.title}
                  onChange={e => setEditFields({...editFields, title: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={editFields.type}
                      onChange={e => setEditFields({...editFields, type: e.target.value})}
                      className="h-10 w-full rounded-md border border-gray-700 bg-background px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {['grant', 'cfp', 'conference', 'hackathon', 'competition', 'workshop', 'fellowship', 'scholarship'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Deadline"
                    type="date"
                    value={editFields.deadline}
                    onChange={e => setEditFields({...editFields, deadline: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    value={editFields.organization}
                    onChange={e => setEditFields({...editFields, organization: e.target.value})}
                  />
                  <Input
                    label="Apply URL"
                    type="url"
                    value={editFields.applyUrl}
                    onChange={e => setEditFields({...editFields, applyUrl: e.target.value})}
                  />
                </div>

                <Input
                  label="Tags (comma separated)"
                  value={editFields.tags}
                  onChange={e => setEditFields({...editFields, tags: e.target.value})}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={6}
                    value={editFields.description}
                    onChange={e => setEditFields({...editFields, description: e.target.value})}
                    className="w-full rounded-md border border-gray-700 bg-background p-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

              </form>

              <div className="p-4 border-t border-gray-800 bg-background flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20"
                  onClick={handleReject}
                  isLoading={reviewMutation.isPending && reviewMutation.variables?.action === 'reject'}
                >
                  Reject & Archive
                </Button>
                <Button 
                  type="submit" 
                  form="reviewForm"
                  className="flex-1 bg-success hover:bg-success/90 text-white"
                  isLoading={reviewMutation.isPending && reviewMutation.variables?.action === 'approve'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
