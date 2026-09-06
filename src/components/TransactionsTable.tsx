import React, { useState } from 'react';
import {
  Search,
  Filter,
  DollarSign,
} from 'lucide-react';
import { BorrowTransaction, Book, Member, TransactionStatus } from '../types/library';

interface TransactionsTableProps {
  transactions: BorrowTransaction[];
  books: Book[];
  members: Member[];
  onPayFine: (transactionId: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  books,
  members,
  onPayFine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');

  const getBook = (id: string) => books.find((b) => b.id === id);
  const getMember = (id: string) => members.find((m) => m.id === id);

  const filteredTransactions = transactions.filter((trx) => {
    const book = getBook(trx.bookId);
    const member = getMember(trx.memberId);

    const matchesSearch =
      trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.bookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || trx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Book title, or Member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg text-xs font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Active Loans (Issued)</option>
            <option value="OVERDUE">Overdue Loans</option>
            <option value="RETURNED">Returned History</option>
          </select>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Circulation Audit Log (`borrow_transactions` Table)
            </h2>
            <p className="text-xs text-slate-400">
              Linked via Foreign Keys: `book_id` &rarr; `books.id`, `member_id` &rarr; `members.id`
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredTransactions.length} of {transactions.length} records
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Book Title</th>
                <th className="px-6 py-3">Borrower</th>
                <th className="px-6 py-3">Issue Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Return Date</th>
                <th className="px-6 py-3">Fine ($0.50/day)</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No circulation records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const book = getBook(trx.bookId);
                  const member = getMember(trx.memberId);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900 text-xs">
                        {trx.id}
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="max-w-[220px]">
                          <p className="font-semibold text-slate-900 truncate">
                            {book?.title || trx.bookId}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">
                            {book?.isbn || trx.bookId}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="max-w-[180px]">
                          <p className="font-medium text-slate-900 truncate">
                            {member?.name || trx.memberId}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {member?.email || trx.memberId}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                        {trx.issueDate}
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                        {trx.dueDate}
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs">
                        {trx.returnDate ? (
                          <span className="text-slate-700">{trx.returnDate}</span>
                        ) : (
                          <span className="text-amber-600 font-sans italic font-medium">
                            Active Loan
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs">
                        {trx.fineAmount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${
                                trx.finePaid ? 'text-slate-400 line-through' : 'text-rose-600'
                              }`}
                            >
                              ${trx.fineAmount.toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                                trx.finePaid
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {trx.finePaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-center">
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

                      <td className="px-6 py-3.5 text-right">
                        {!trx.finePaid && trx.fineAmount > 0 && (
                          <button
                            onClick={() => onPayFine(trx.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
