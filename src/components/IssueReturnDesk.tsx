import React, { useState } from 'react';
import {
  ArrowLeftRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Book, Member, BorrowTransaction } from '../types/library';
import { DAILY_FINE_RATE } from '../services/database';

interface IssueReturnDeskProps {
  books: Book[];
  members: Member[];
  transactions: BorrowTransaction[];
  initialSelectedBookId?: string;
  onIssueBook: (params: {
    bookId: string;
    memberId: string;
    durationDays: number;
    issueDateStr?: string;
  }) => { success: boolean; error?: string; transaction?: BorrowTransaction };
  onReturnBook: (params: {
    transactionId: string;
    returnDateStr?: string;
    markFinePaid: boolean;
  }) => { success: boolean; error?: string; fine?: number };
}

export const IssueReturnDesk: React.FC<IssueReturnDeskProps> = ({
  books,
  members,
  transactions,
  initialSelectedBookId,
  onIssueBook,
  onReturnBook,
}) => {
  const [activeTab, setActiveTab] = useState<'ISSUE' | 'RETURN'>('ISSUE');

  // Issue form state
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialSelectedBookId || (books.find((b) => b.availableCopies > 0)?.id || '')
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members[0]?.id || ''
  );
  const [durationDays, setDurationDays] = useState<number>(14);
  const [issueDateOverride, setIssueDateOverride] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [issueMessage, setIssueMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Return form state
  const activeTransactions = transactions.filter((t) => !t.returnDate);
  const [selectedTrxId, setSelectedTrxId] = useState<string>(
    activeTransactions[0]?.id || ''
  );
  const [returnDateOverride, setReturnDateOverride] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [collectFineNow, setCollectFineNow] = useState(true);
  const [returnMessage, setReturnMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Computed data for selected issue items
  const currentBook = books.find((b) => b.id === selectedBookId);
  const currentMember = members.find((m) => m.id === selectedMemberId);
  const memberActiveBorrows = currentMember
    ? transactions.filter((t) => t.memberId === currentMember.id && !t.returnDate).length
    : 0;

  // Computed data for selected return item
  const currentReturnTrx = activeTransactions.find((t) => t.id === selectedTrxId);
  const returnTrxBook = currentReturnTrx ? books.find((b) => b.id === currentReturnTrx.bookId) : null;
  const returnTrxMember = currentReturnTrx ? members.find((m) => m.id === currentReturnTrx.memberId) : null;

  // Live Fine Preview calculation
  let calculatedDaysOverdue = 0;
  let calculatedFineAmount = 0;
  if (currentReturnTrx) {
    const due = new Date(currentReturnTrx.dueDate);
    due.setHours(0, 0, 0, 0);
    const returnD = new Date(returnDateOverride);
    returnD.setHours(0, 0, 0, 0);
    if (returnD > due) {
      calculatedDaysOverdue = Math.ceil((returnD.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      calculatedFineAmount = Number((calculatedDaysOverdue * DAILY_FINE_RATE).toFixed(2));
    }
  }

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueMessage(null);

    if (!selectedBookId || !selectedMemberId) {
      setIssueMessage({ type: 'error', text: 'Please select both a book and a member.' });
      return;
    }

    const res = onIssueBook({
      bookId: selectedBookId,
      memberId: selectedMemberId,
      durationDays: Number(durationDays),
      issueDateStr: issueDateOverride,
    });

    if (res.success) {
      setIssueMessage({
        type: 'success',
        text: `Success! Book issued. Transaction ${res.transaction?.id} created. Inventory count updated.`,
      });
    } else {
      setIssueMessage({ type: 'error', text: res.error || 'Failed to issue book.' });
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnMessage(null);

    if (!selectedTrxId) {
      setReturnMessage({ type: 'error', text: 'No active transaction selected.' });
      return;
    }

    const res = onReturnBook({
      transactionId: selectedTrxId,
      returnDateStr: returnDateOverride,
      markFinePaid: collectFineNow,
    });

    if (res.success) {
      setReturnMessage({
        type: 'success',
        text: `Book returned successfully! ${
          res.fine && res.fine > 0
            ? `Fine of $${res.fine.toFixed(2)} (${calculatedDaysOverdue} days overdue) ${
                collectFineNow ? 'collected at desk' : 'recorded as pending'
              }.`
            : 'Returned within due date with $0 fine.'
        } Inventory copy restored.`,
      });
      // Switch next available
      const nextActive = activeTransactions.filter((t) => t.id !== selectedTrxId);
      if (nextActive.length > 0) {
        setSelectedTrxId(nextActive[0].id);
      }
    } else {
      setReturnMessage({ type: 'error', text: res.error || 'Return processing failed.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl border shadow-sm">
        <button
          onClick={() => {
            setActiveTab('ISSUE');
            setIssueMessage(null);
          }}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ISSUE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Issue Book (Checkout Desk)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('RETURN');
            setReturnMessage(null);
          }}
          className={`py-3.5 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'RETURN'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return Book & Overdue Fine Desk</span>
          {activeTransactions.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-50 text-indigo-600 border border-indigo-200">
              {activeTransactions.length} active
            </span>
          )}
        </button>
      </div>

      {/* ===================== ISSUE WORKFLOW ===================== */}
      {activeTab === 'ISSUE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Issue Book to Patron</h3>
              <p className="text-xs text-slate-500">
                Checks referential integrity, available copy inventory, and member active quota limits.
              </p>
            </div>

            {issueMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  issueMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {issueMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{issueMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              {/* Select Book */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Book Title (Inventory) *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.id}] {b.title} — ({b.availableCopies} of {b.totalCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Member (Borrower) *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                >
                  {members.map((m) => {
                    const activeCount = transactions.filter(
                      (t) => t.memberId === m.id && !t.returnDate
                    ).length;
                    return (
                      <option key={m.id} value={m.id}>
                        [{m.id}] {m.name} ({m.type}) — {activeCount}/{m.maxBorrowLimit} books checked out
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDateOverride}
                    onChange={(e) => setIssueDateOverride(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loan Period (Days)
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={7}>7 Days (Short Loan)</option>
                    <option value={14}>14 Days (Standard Student Loan)</option>
                    <option value={21}>21 Days</option>
                    <option value={30}>30 Days (Faculty Loan)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Transaction will be executed atomically in the MySQL engine.
                </span>
                <button
                  type="submit"
                  disabled={!currentBook || currentBook.availableCopies <= 0}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Execute Issue Transaction</span>
                </button>
              </div>
            </form>
          </div>

          {/* Validation & Live Preview Sidebar */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Referential Integrity Check
            </h4>

            {currentBook && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Target Book Details</span>
                </div>
                <p className="font-semibold text-slate-900">{currentBook.title}</p>
                <p className="text-slate-500 text-[11px]">Author: {currentBook.author}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Available stock:</span>
                  <span
                    className={`font-bold ${
                      currentBook.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {currentBook.availableCopies} of {currentBook.totalCopies} copies
                  </span>
                </div>
              </div>
            )}

            {currentMember && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Patron Status & Quota</span>
                </div>
                <p className="font-semibold text-slate-900">{currentMember.name}</p>
                <p className="text-slate-500 text-[11px]">Role: {currentMember.type} ({currentMember.status})</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Active Borrows:</span>
                  <span
                    className={`font-bold ${
                      memberActiveBorrows >= currentMember.maxBorrowLimit
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {memberActiveBorrows} / {currentMember.maxBorrowLimit} limit
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
              <p className="font-semibold">Parameterized SQL Query:</p>
              <code className="block bg-white p-2 rounded border border-indigo-100 text-[10px] font-mono text-slate-800 break-all">
                INSERT INTO borrow_transactions VALUES (%s, %s, %s, %s, %s, NULL, 0, FALSE, 'ISSUED');
              </code>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RETURN WORKFLOW ===================== */}
      {activeTab === 'RETURN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Return Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Process Book Return & Overdue Fine</h3>
              <p className="text-xs text-slate-500">
                Calculates daily late fines ($0.50/day) beyond due date, marks transaction complete, and restores book stock.
              </p>
            </div>

            {returnMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  returnMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {returnMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{returnMessage.text}</span>
              </div>
            )}

            {activeTransactions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">All books have been returned!</p>
                <p className="text-xs text-slate-500 mt-1">There are no outstanding checked out loans.</p>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Active Borrowing to Return *
                  </label>
                  <select
                    value={selectedTrxId}
                    onChange={(e) => setSelectedTrxId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-mono"
                  >
                    {activeTransactions.map((trx) => {
                      const book = books.find((b) => b.id === trx.bookId);
                      const member = members.find((m) => m.id === trx.memberId);
                      return (
                        <option key={trx.id} value={trx.id}>
                          [{trx.id}] {book?.title || trx.bookId} — {member?.name} (Due: {trx.dueDate})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Return Date (Simulate Overdue)
                    </label>
                    <input
                      type="date"
                      value={returnDateOverride}
                      onChange={(e) => setReturnDateOverride(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Select a date past the due date to test dynamic fine calculations.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fine Collection Status
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="collect-fine-checkbox"
                        checked={collectFineNow}
                        onChange={(e) => setCollectFineNow(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="collect-fine-checkbox" className="text-xs text-slate-700 cursor-pointer">
                        Mark fine as collected / paid at desk
                      </label>
                    </div>
                  </div>
                </div>

                {/* Overdue Fine Summary Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    calculatedDaysOverdue > 0
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`w-5 h-5 ${
                          calculatedDaysOverdue > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          {calculatedDaysOverdue > 0 ? 'Overdue Return Detected' : 'On-Time Return'}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {calculatedDaysOverdue > 0
                            ? `${calculatedDaysOverdue} days past due date (${currentReturnTrx?.dueDate})`
                            : 'Returned on or before due date.'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total Fine</span>
                      <span
                        className={`text-2xl font-mono font-extrabold ${
                          calculatedDaysOverdue > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        ${calculatedFineAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {calculatedDaysOverdue > 0 && (
                    <div className="mt-3 pt-2 border-t border-rose-200/60 text-[11px] font-mono text-rose-800">
                      Formula: {calculatedDaysOverdue} overdue days × ${DAILY_FINE_RATE.toFixed(2)}/day = ${calculatedFineAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Will increment available copies count from {returnTrxBook?.availableCopies} to {(returnTrxBook?.availableCopies ?? 0) + 1}.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Confirm Book Return</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Current Loan Info */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Transaction Details
            </h4>

            {currentReturnTrx && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-mono">Transaction ID</span>
                  <p className="font-bold text-slate-900 font-mono text-sm">{currentReturnTrx.id}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400">Book</span>
                  <p className="font-semibold text-slate-900">{returnTrxBook?.title}</p>
                  <p className="text-slate-500 text-[11px] font-mono">{returnTrxBook?.isbn}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400">Borrower</span>
                  <p className="font-semibold text-slate-900">{returnTrxMember?.name}</p>
                  <p className="text-slate-500 text-[11px]">{returnTrxMember?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block">Issued:</span>
                    <span className="font-semibold text-slate-800">{currentReturnTrx.issueDate}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block">Due Date:</span>
                    <span className="font-semibold text-slate-800">{currentReturnTrx.dueDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
