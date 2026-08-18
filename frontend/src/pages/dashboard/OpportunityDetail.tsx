import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, CalendarPlus, ExternalLink, Bookmark, 
  Building2, MapPin, Database, Clock, FileText, CheckCircle, DollarSign,
  Flag, CheckSquare
} from 'lucide-react';

export const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch Opportunity
  const { data: opportunity, isLoading, isError } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const res = await api.get(`/opportunities/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  // Fetch Bookmarks
  const { data: bookmarksData } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data; 
    },
  });

  const isBookmarked = bookmarksData?.some((b: any) => b.opportunityId === id) || false;

  // Toggle Bookmark Mutation
  const toggleBookmark = useMutation({
    mutationFn: async () => {
      await api.post(`/bookmarks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const markAppliedMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/tracker/${id}`, { status: 'applied' });
    },
    onSuccess: () => {
      alert('Successfully moved to your Applied Tracker!');
    }
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      // In a real app this might hit a /reports endpoint or Slack webhook
      alert('Thanks for reporting! A curator will review this opportunity.');
    }
  });

  // Handle Calendar Download
  const handleDownloadCalendar = async () => {
    try {
      const res = await api.get(`/opportunities/${id}/calendar`, {
        responseType: 'blob' // Important for handling binary data like .ics
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deadline-${id}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download calendar', error);
      alert('Failed to generate calendar event. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-2">Opportunity Not Found</h2>
        <p className="text-gray-400 mb-6">The opportunity you're looking for doesn't exist or is no longer published.</p>
        <Link to="/">
          <Button variant="outline">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  // Calculate flags
  const now = new Date();
  const deadlineDate = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const daysUntilDeadline = deadlineDate 
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
    : null;
  const isClosingSoon = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back Navigation */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Feed
      </Link>

      {/* Hero Section */}
      <div className="bg-surface rounded-xl border border-gray-800 p-6 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="uppercase tracking-wider text-[10px]">
                {opportunity.type}
              </Badge>
              {isClosingSoon && <Badge variant="deadline">Closing Soon</Badge>}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {opportunity.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {opportunity.organization && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {opportunity.organization}
                </span>
              )}
              {opportunity.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </span>
              )}
              {opportunity.sourceId?.name && (
                <span className="flex items-center gap-1.5 text-primary/80">
                  <Database className="h-4 w-4" />
                  Found via {opportunity.sourceId.name}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <a href={opportunity.applyUrl || opportunity.url} target="_blank" rel="noopener noreferrer">
              <Button className="w-full gap-2">
                Apply Now <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => toggleBookmark.mutate()}
                isLoading={toggleBookmark.isPending}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              
              {opportunity.deadline && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={handleDownloadCalendar}
                  title="Download .ics Calendar Event"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Calendar
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => markAppliedMutation.mutate()}
                isLoading={markAppliedMutation.isPending}
              >
                <CheckSquare className="h-4 w-4 text-success" />
                Mark Applied
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => reportMutation.mutate()}
                isLoading={reportMutation.isPending}
              >
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Details (Left/Center) */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {opportunity.description && (
            <div className="bg-surface rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Description
              </h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {opportunity.description}
              </div>
            </div>
          )}

          {/* Eligibility */}
          {opportunity.eligibility && (
            <div className="bg-surface rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                Eligibility Requirements
              </h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                {opportunity.eligibility}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          {/* Amount / Funding */}
          {opportunity.amount && (
            <div className="bg-success/10 border border-success/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-success uppercase tracking-wider mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Funding Amount
              </h3>
              <p className="text-xl font-bold text-white">
                {opportunity.amount}
              </p>
            </div>
          )}

          {/* Deadline Info */}
          {opportunity.deadline && (
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Deadline
              </h3>
              <p className="text-lg font-medium text-white mb-1">
                {deadlineDate?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className={`text-sm ${isClosingSoon ? 'text-deadline font-bold' : 'text-gray-500'}`}>
                {daysUntilDeadline! < 0 ? 'Closed' : `Ends in ${daysUntilDeadline} days`}
              </p>
            </div>
          )}

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="bg-surface border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Tags & Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
