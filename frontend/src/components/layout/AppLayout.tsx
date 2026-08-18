import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  LayoutDashboard, 
  Bookmark, 
  Send, 
  BellRing, 
  Settings, 
  CheckSquare, 
  Database, 
  Users, 
  Activity, 
  FileText,
  Search,
  Bell,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../ui/Button';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications(!!user);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-gray-400 hover:bg-surface hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-800 bg-background flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold tracking-tighter">OR</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Opportunity Radar</h1>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Discover Group */}
          <div>
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Discover</h2>
            <div className="space-y-1">
              <NavItem to="/" icon={LayoutDashboard} label="Feed" />
              <NavItem to="/bookmarks" icon={Bookmark} label="Bookmarks" />
              <NavItem to="/applied" icon={Send} label="Applied" />
            </div>
          </div>

          {/* You Group */}
          <div>
            <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">You</h2>
            <div className="space-y-1">
              <NavItem to="/alerts" icon={BellRing} label="Alerts & Interests" />
              <NavItem to="/notifications" icon={Bell} label="Notifications" />
            </div>
          </div>

          {/* Manage Group (Role Based) */}
          {(user?.role === 'curator' || user?.role === 'admin' || user?.role === 'super_admin') && (
            <div>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Manage</h2>
              <div className="space-y-1">
                <NavItem to="/review" icon={CheckSquare} label="Review Queue" />
                
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <>
                    <NavItem to="/sources" icon={Database} label="Sources" />
                    <NavItem to="/members" icon={Users} label="Members" />
                    <NavItem to="/kpis" icon={Activity} label="KPIs" />
                    <NavItem to="/logs" icon={FileText} label="Audit Logs" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">Every opportunity, in one feed.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-800 bg-background/80 backdrop-blur-sm px-6">
          
          {/* Search */}
          <div className="flex items-center w-full max-w-md relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search opportunities..." 
              className="h-9 w-full rounded-md border border-gray-800 bg-surface pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-surface">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-deadline text-[9px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white leading-none">{user?.name || 'User'}</span>
                <span className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-surface border border-gray-700 flex items-center justify-center text-gray-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 text-gray-500 hover:text-white hover:bg-surface rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
