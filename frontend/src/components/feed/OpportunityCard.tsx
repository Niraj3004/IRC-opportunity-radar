import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './Card';
import { Badge } from './Badge';
import { Bookmark, Clock, MapPin, Building2, ExternalLink, Database } from 'lucide-react';
import { Button } from './Button';

export interface Opportunity {
  _id: string;
  title: string;
  type: string;
  organization?: string;
  url: string;
  applyUrl?: string;
  deadline?: string;
  location?: string;
  tags: string[];
  amount?: string;
  createdAt: string;
  publishedAt?: string;
  sourceId?: {
    name: string;
    url?: string;
    type?: string;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const OpportunityCard = ({ opportunity, isBookmarked, onToggleBookmark }: OpportunityCardProps) => {
  
  // Calculate flags
  const now = new Date();
  const deadlineDate = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const publishedDate = opportunity.publishedAt ? new Date(opportunity.publishedAt) : new Date(opportunity.createdAt);
  
  const daysUntilDeadline = deadlineDate 
    ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) 
    : null;
    
  const daysSincePublished = Math.ceil((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));

  const isClosingSoon = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  const isNew = daysSincePublished <= 3;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <Link to={`/opportunity/${opportunity._id}`} className="space-y-1.5 flex-1 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="uppercase tracking-wider text-[10px]">
              {opportunity.type}
            </Badge>
            {isNew && <Badge variant="success">New</Badge>}
            {isClosingSoon && <Badge variant="deadline">Closing Soon</Badge>}
          </div>
          <h3 className="text-lg font-bold leading-tight text-white mt-2">
            {opportunity.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-400 gap-4 mt-1">
            {opportunity.organization && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {opportunity.organization}
              </span>
            )}
            {opportunity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {opportunity.location}
              </span>
            )}
            {opportunity.sourceId && opportunity.sourceId.name && (
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {opportunity.sourceId.name}
              </span>
            )}
          </div>
        </Link>

        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark(opportunity._id);
          }}
          className="text-gray-500 hover:text-primary transition-colors p-1 z-10"
          title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
        </button>
      </CardHeader>
      
      <CardContent>
        <Link to={`/opportunity/${opportunity._id}`}>
          <div className="flex flex-wrap gap-2 mb-4 hover:opacity-80 transition-opacity">
            {opportunity.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">
                {tag}
              </span>
            ))}
            {opportunity.tags.length > 4 && (
              <span className="text-xs text-gray-500 py-1">
                +{opportunity.tags.length - 4} more
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-4">
          <div className="flex flex-col">
            {opportunity.amount && (
              <span className="text-sm font-semibold text-success">{opportunity.amount}</span>
            )}
            {deadlineDate ? (
              <span className={`flex items-center gap-1 text-xs mt-0.5 ${isClosingSoon ? 'text-deadline font-medium' : 'text-gray-400'}`}>
                <Clock className="h-3 w-3" />
                {daysUntilDeadline! < 0 ? 'Closed' : `Ends in ${daysUntilDeadline} days`}
              </span>
            ) : (
              <span className="text-xs text-gray-500 mt-0.5">Rolling deadline</span>
            )}
          </div>

          <div className="flex gap-2">
            <Link to={`/opportunity/${opportunity._id}`}>
              <Button variant="outline" size="sm">Details</Button>
            </Link>
            <a href={opportunity.applyUrl || opportunity.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="gap-2">
                Apply <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
