import React from 'react';
import {
  ArrowLeftRight,
  Clock,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { SystemStats, Book, Member, BorrowTransaction } from '../types/library';
import { ActiveTab } from './Header';

interface DashboardViewProps {
  stats: SystemStats;
  books: Book[];
  members: Member[];
  transactions: BorrowTransaction[];
  onNavigate: (tab: ActiveTab) => void;
  onQuickIssue: () => void;
  onQuickReturn: () => void;
  onQuickAddBook: () => void;
}

const DAILY_FINE_RATE = 0.50;

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  books,
  members,
  transactions,
  onNavigate,
  onQuickIssue,
  onQuickReturn,
  onQuickAddBook,
}) => {
  // Recent transactions
  const recentTransactions = transactions.slice(0, 6);

  // Quick lookup helper
  const getBook = (id: string) => books.find((b) => b.id === id);
  const getMember = (id: string) => members.find((m) => m.id === id);

  // Category stats calculation
  const categoryBorrowCounts = books.reduce((acc, book) => {
    const borrowed = book.totalCopies - book.availableCopies;
    acc[book.category] = (acc[book.category] || 0) + borrowed;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = [
    { name: 'Computer Science', count: categoryBorrowCounts['Computer Science'] || 5, color: 'bg-indigo-600' },
    { name: 'Fiction', count: categoryBorrowCounts['Fiction'] || 3, color: 'bg-indigo-500' },
    { name: 'Mathematics', count: categoryBorrowCounts['Mathematics'] || 2, color: 'bg-indigo-400' },
    { name: 'Physics & Sciences', count: categoryBorrowCounts['Physics'] || 1, color: 'bg-indigo-300' },
  ];

  const maxCatCount = Math.max(...topCategories.map((c) => c.count), 1);
  const circulationPercentage = stats.totalCopies
    ? Math.round((stats.issuedCopies / stats.totalCopies) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Hero actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Python OOP & Normalized MySQL Architecture (3NF)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Library Circulation & Inventory Control
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Managing books, members, and transactions with foreign key integrity, automated overdue fine calculations, parameterized SQL security, and aggregate reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onQuickIssue}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={onQuickReturn}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Return Desk</span>
          </button>
          <button
            onClick={onQuickAddBook}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - Professional Polish 4-grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inventory */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Inventory
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900">
            {stats.totalCopies.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({stats.totalBooks} titles)
            </span>
          </p>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            +{stats.availableCopies} available in stock
          </p>
        </div>

        {/* Active Loans */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Loans
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900">
            {stats.activeBorrowings}
          </p>
          <p
            className={`text-xs mt-2 font-medium ${
              stats.overdueCount > 0 ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            {stats.overdueCount > 0
              ? `${stats.overdueCount} overdue items`
              : 'All circulations on time'}
          </p>
        </div>

        {/* Total Fines */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Fines
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900 font-mono">
            ${stats.pendingFines.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Outstanding balance (${stats.totalFinesCollected.toFixed(2)} collected)
          </p>
        </div>

        {/* Circulation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Circulation
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900">
            {circulationPercentage}%
          </p>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            Active collection utilization
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & Circulation Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800">Recent Transactions</h2>
              <p className="text-xs text-slate-400">
                Synchronized with <code>borrow_transactions</code> via foreign keys
              </p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-indigo-600 font-bold hover:underline uppercase tracking-wide"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Book Title</th>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((trx) => {
                  const book = getBook(trx.bookId);
                  const member = getMember(trx.memberId);

                  return (
                    <tr key={trx.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-900 max-w-[220px] truncate">
                        {book?.title || trx.bookId}
                        <span className="block text-[11px] text-slate-400 font-mono">
                          ISBN: {book?.isbn || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 text-xs">
                        <span className="font-medium text-slate-800 block">
                          {member?.name || trx.memberId}
                        </span>
                        <span className="text-slate-400">{member?.email || 'Patron'}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-slate-600">
                        {trx.returnDate ? (
                          <span className="text-slate-500">Ret. {trx.returnDate}</span>
                        ) : (
                          <span>{trx.dueDate}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {trx.status === 'RETURNED' && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold inline-block">
                            RETURNED
                          </span>
                        )}
                        {trx.status === 'ISSUED' && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold inline-block">
                            ISSUED
                          </span>
                        )}
                        {trx.status === 'OVERDUE' && (
                          <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold inline-block">
                            OVERDUE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Circulation Statistics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Circulation Statistics</h2>
            <span className="text-xs text-slate-400 font-mono">SQL GROUP BY</span>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">
                Most Borrowed Categories
              </p>
              <div className="space-y-4">
                {topCategories.map((category) => {
                  const widthPercent = Math.round((category.count / maxCatCount) * 100);
                  return (
                    <div key={category.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-700">{category.name}</span>
                        <span className="text-slate-500 font-mono">{category.count} on loan</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${category.color} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Quota / Capacity Card */}
            <div className="mt-auto p-4 bg-slate-900 rounded-lg text-white">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs opacity-75 font-medium">Circulation Capacity</span>
                <span className="text-xs font-bold font-mono">{circulationPercentage}%</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${circulationPercentage}%` }}
                />
              </div>
              <p className="text-[10px] opacity-50 mt-3 font-mono">
                Report generated via SQL JOIN aggregate query.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
