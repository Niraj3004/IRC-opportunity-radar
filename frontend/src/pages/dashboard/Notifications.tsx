import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Bell, Check, ExternalLink, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Notifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-gray-400">System alerts, new opportunities, and updates.</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
        {notifications?.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white">All caught up!</h3>
            <p className="text-gray-400 mt-1">You have no new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications?.map((notification: any) => (
              <div 
                key={notification._id} 
                className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'bg-transparent' : 'bg-primary/5'}`}
              >
                <div className="shrink-0 mt-1">
                  {notification.channel === 'email' ? (
                    <Mail className={`h-5 w-5 ${notification.isRead ? 'text-gray-500' : 'text-primary'}`} />
                  ) : (
                    <Bell className={`h-5 w-5 ${notification.isRead ? 'text-gray-500' : 'text-primary'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex gap-3">
                    {notification.linkUrl && (
                      <a 
                        href={notification.linkUrl} 
                        className="text-xs text-primary hover:text-white transition-colors flex items-center gap-1"
                      >
                        View Details <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsReadMutation.mutate(notification._id)}
                        disabled={markAsReadMutation.isPending}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                
                {!notification.isRead && (
                  <div className="shrink-0 flex items-center">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
