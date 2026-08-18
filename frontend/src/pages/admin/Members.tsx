import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

export const Members = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const res = await api.get('/admin/members');
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, role }: { id: string, status?: string, role?: string }) => {
      await api.patch(`/admin/members/${id}`, { status, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Members Management
        </h1>
        <p className="text-gray-400">Approve users and manage roles.</p>
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-gray-800 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {members?.map((member: any) => (
                <tr key={member._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-gray-500 text-xs">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={member.role}
                      disabled={member._id === currentUser?._id || updateMutation.isPending}
                      onChange={(e) => updateMutation.mutate({ id: member._id, role: e.target.value })}
                      className="bg-background border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none focus:border-primary disabled:opacity-50"
                    >
                      <option value="member">Member</option>
                      <option value="curator">Curator</option>
                      <option value="admin">Admin</option>
                      {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={
                        member.status === 'active' ? 'success' : 
                        member.status === 'suspended' ? 'deadline' : 'default'
                      }
                    >
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member._id !== currentUser?._id && (
                      <div className="flex justify-end gap-2">
                        {member.status === 'pending' && (
                          <button 
                            onClick={() => updateMutation.mutate({ id: member._id, status: 'active' })}
                            className="p-1.5 text-success hover:bg-success/10 rounded transition-colors"
                            title="Approve"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        {member.status === 'active' && (
                          <button 
                            onClick={() => updateMutation.mutate({ id: member._id, status: 'suspended' })}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Suspend"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                        {member.status === 'suspended' && (
                          <button 
                            onClick={() => updateMutation.mutate({ id: member._id, status: 'active' })}
                            className="p-1.5 text-gray-400 hover:bg-gray-800 rounded transition-colors"
                            title="Restore"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
