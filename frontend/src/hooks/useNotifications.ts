import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  message: string;
  read: boolean;
  relatedOpportunity?: string;
  createdAt: string;
}

export const useNotifications = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data.items as Notification[];
    },
    enabled: isAuthenticated, // Only fetch if the user is logged in
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });
};
