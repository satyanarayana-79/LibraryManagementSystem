import React from 'react';
import {
  Menu,
  Search,
  Code2,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SystemStats } from '../types/library';

export type ActiveTab =
  | 'dashboard'
  | 'books'
  | 'members'
  | 'issue-return'
  | 'transactions'
  | 'sql-reports'
  | 'oop-architecture'
  | 'terminal';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: SystemStats;
  onResetData: () => void;
  onExportSql: () => void;
  onViewPythonScript: () => void;
  onOpenMobileMenu?: () => void;
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onResetData,
  onExportSql,
  onViewPythonScript,
  onOpenMobileMenu,
  globalSearch = '',
  onGlobalSearchChange,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
      {/* Mobile Menu Button + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ISBN, Title, or Author..."
            value={globalSearch}
            onChange={(e) => {
              if (onGlobalSearchChange) {
                onGlobalSearchChange(e.target.value);
              }
              if (activeTab !== 'books' && activeTab !== 'transactions' && e.target.value) {
                setActiveTab('books');
              }
            }}
            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Header: System Actions & Administrator Profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onViewPythonScript}
            title="View Python OOP Script (library_system.py)"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Python Script</span>
          </button>

          <button
            onClick={onExportSql}
            title="Export Normalized MySQL DDL & Seed Data"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export SQL</span>
          </button>

          <button
            onClick={onResetData}
            title="Reset Database to Seed State"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900 leading-tight">
              Administrator
            </span>
            <span className="text-xs text-slate-500">
              Systems Librarian
            </span>
          </div>
          <div className="w-10 h-10 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm select-none">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};
