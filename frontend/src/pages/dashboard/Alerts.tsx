import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Bell, CheckCircle, Tag, X, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Alerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');
  const [localInterests, setLocalInterests] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(true);

  // Fetch current user profile to get latest interests
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (profile?.interests) {
      setLocalInterests(profile.interests);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const res = await api.patch('/auth/profile', { interests });
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      setIsSaved(true);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to update alerts');
    }
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!localInterests.includes(newTag)) {
        setLocalInterests([...localInterests, newTag]);
        setIsSaved(false);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLocalInterests(localInterests.filter(t => t !== tagToRemove));
    setIsSaved(false);
  };

  const handleSave = () => {
    updateMutation.mutate(localInterests);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Alerts & Interests
        </h1>
        <p className="text-gray-400">Manage your personalized opportunity alerts. We'll email you instantly when a new match is published!</p>
      </div>

      <div className="bg-surface border border-gray-800 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-background/30">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Targeted Email Alerts</h2>
            <p className="text-sm text-gray-400">Add keywords, tags, or topics you are actively monitoring.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
              <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
            </div>
            <span className="text-sm font-medium text-white">Active</span>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Your Monitored Tags
            </label>
            
            <div className="bg-background border border-gray-700 rounded-lg p-3 min-h-[120px] flex flex-wrap gap-2 items-start focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              {localInterests.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary-light text-sm font-medium border border-primary/30"
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-primary hover:text-white transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={localInterests.length === 0 ? "Type a tag (e.g., 'climate', 'fellowship') and press Enter" : "Add more tags..."}
                className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-white text-sm py-1.5 px-2 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">How it works</p>
              <p>Whenever a new opportunity is published that matches ANY of your monitored tags (either in the title, description, or the AI-generated tags), our agent will immediately dispatch a personalized alert to <span className="font-semibold">{user?.email}</span>.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-background/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {!isSaved && (
              <span className="text-yellow-500 font-medium flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                You have unsaved changes
              </span>
            )}
            {isSaved && updateMutation.isSuccess && (
              <span className="text-success font-medium flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Preferences saved!
              </span>
            )}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaved || updateMutation.isPending}
            isLoading={updateMutation.isPending}
            className={!isSaved ? "bg-primary hover:bg-primary-dark text-white" : "bg-gray-800 text-gray-500"}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
