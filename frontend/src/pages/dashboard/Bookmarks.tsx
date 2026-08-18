import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { OpportunityCard, type Opportunity } from '../../components/feed/OpportunityCard';
import { Bookmark as BookmarkIcon } from 'lucide-react';

export const Bookmarks = () => {
  const queryClient = useQueryClient();
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks-list'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <BookmarkIcon className="h-6 w-6 text-primary" />
          Saved Opportunities
        </h1>
        <p className="text-gray-400">All the grants and opportunities you've bookmarked for later.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : bookmarks?.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-xl border border-gray-800">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white">No bookmarks yet</h3>
          <p className="text-gray-400 mt-1">Opportunities you bookmark from the feed will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookmarks?.map((bookmark: { _id: string, opportunityId: Opportunity }) => (
            <OpportunityCard 
              key={bookmark._id} 
              opportunity={bookmark.opportunityId} 
              isBookmarked={true}
              onToggleBookmark={() => queryClient.invalidateQueries({ queryKey: ['bookmarks-list'] })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
