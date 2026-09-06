import React from 'react';
import {
  BarChart3,
  BookOpen,
  Users,
  ArrowLeftRight,
  History,
  Database,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { ActiveTab } from './Header';
import { SystemStats } from '../types/library';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: SystemStats;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'books',
      label: 'Book Catalog',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      badge: stats.totalBooks,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'members',
      label: 'Member Registry',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: stats.totalMembers,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'issue-return',
      label: 'Issue & Return Desk',
      icon: <ArrowLeftRight className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'transactions',
      label: 'Loan Transactions',
      icon: <History className="w-4 h-4 shrink-0" />,
      badge: stats.overdueCount > 0 ? `${stats.overdueCount} overdue` : stats.activeBorrowings,
      badgeColor: stats.overdueCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300',
    },
    {
      id: 'sql-reports',
      label: 'Reports & Analytics',
      icon: <Database className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'oop-architecture',
      label: 'OOP & Security',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'terminal',
      label: 'Python CLI Console',
      icon: <Terminal className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xl shadow-xs">
              L
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-lg block leading-tight">
                BiblioSQL v2.4
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                LMS Enterprise
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-slate-800 text-xs flex flex-col gap-2 font-mono">
          <div className="flex justify-between items-center">
            <span className="opacity-60 text-slate-400">MySQL Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CONNECTED
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-60 text-slate-400">Engine / 3NF</span>
            <span className="text-slate-300">InnoDB ACID</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-60 text-slate-400">Active Loans</span>
            <span className="text-slate-300 font-semibold">{stats.activeBorrowings} items</span>
          </div>
        </div>
      </aside>
    </>
  );
};
