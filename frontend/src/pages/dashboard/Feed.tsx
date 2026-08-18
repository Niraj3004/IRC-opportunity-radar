import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { OpportunityCard, Opportunity } from '../../components/feed/OpportunityCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Filter, Search } from 'lucide-react';

const OPPORTUNITY_TYPES = [
  'grant', 'cfp', 'conference', 'hackathon', 
  'competition', 'workshop', 'fellowship', 'scholarship'
];

export const Feed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const tag = searchParams.get('tag') || '';

  // Local state for the search input to avoid refetching on every keystroke
  const [searchInput, setSearchInput] = useState(q);
  const [tagInput, setTagInput] = useState(tag);

  // Fetch Opportunities
  const { data: opportunitiesData, isLoading: isLoadingOpp } = useQuery({
    queryKey: ['opportunities', { page, type, q, sort, tag }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (type) params.append('type', type);
      if (q) params.append('q', q);
      if (sort) params.append('sort', sort);
      if (tag) params.append('tag', tag);

      const res = await api.get(`/opportunities?${params.toString()}`);
      return res.data.data;
    },
  });

  // Fetch Bookmarks
  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data; 
    },
  });

  const bookmarkedSet = new Set(bookmarksData?.map((b: any) => b.opportunityId) || []);

  // Toggle Bookmark Mutation
  const toggleBookmark = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/bookmarks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    
    if (searchInput) newParams.set('q', searchInput);
    else newParams.delete('q');
    
    if (tagInput) newParams.set('tag', tagInput.toLowerCase());
    else newParams.delete('tag');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchInput('');
    setTagInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">Discovery Feed</h1>
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-4 p-4 bg-surface rounded-lg border border-gray-800">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-700 bg-background pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-700 bg-background px-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button type="submit" className="h-9">Search</Button>
          </form>

          <div className="flex items-center gap-4 border-t border-gray-800 pt-4">
            <select
              value={type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="h-9 rounded-md border border-gray-700 bg-background px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Types</option>
              {OPPORTUNITY_TYPES.map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="h-9 rounded-md border border-gray-700 bg-background px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest First</option>
              <option value="deadline_asc">Closing Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      {isLoadingOpp ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : opportunitiesData?.items?.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-lg border border-gray-800">
          <Filter className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white">No opportunities found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
          {(q || type || tag) && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {opportunitiesData?.items?.map((opp: Opportunity) => (
            <OpportunityCard 
              key={opp._id} 
              opportunity={opp} 
              isBookmarked={bookmarkedSet.has(opp._id)}
              onToggleBookmark={(id) => toggleBookmark.mutate(id)}
            />
          ))}

          {/* Pagination */}
          {opportunitiesData?.pagination?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 pt-4">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page <= 1}
                onClick={() => handleFilterChange('page', (page - 1).toString())}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-400">
                Page {page} of {opportunitiesData.pagination.totalPages}
              </span>
              <Button 
                variant="outline"
                size="sm"
                disabled={page >= opportunitiesData.pagination.totalPages}
                onClick={() => handleFilterChange('page', (page + 1).toString())}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
