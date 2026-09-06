import React, { useState } from 'react';
import {
  Database,
  BarChart3,
  AlertTriangle,
  Calendar,
  Play,
  Copy,
  Check,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { db } from '../services/database';
import { SqlQueryResult } from '../types/library';

export const SqlReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'POPULAR' | 'OVERDUE' | 'MONTHLY' | 'CUSTOM'>('POPULAR');
  const [copiedQuery, setCopiedQuery] = useState(false);

  // Custom SQL Runner state
  const [customSql, setCustomSql] = useState<string>(
    `SELECT b.title, b.author, COUNT(t.transaction_id) AS borrow_count\nFROM books b\nLEFT JOIN borrow_transactions t ON b.book_id = t.book_id\nGROUP BY b.book_id\nORDER BY borrow_count DESC;`
  );
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(() =>
    db.executeSqlQuery('SELECT most borrowed')
  );

  const mostBorrowedData = db.reportMostBorrowedBooks(8);
  const overdueMembersData = db.reportOverdueMembers();
  const monthlyData = db.reportMonthlyCirculation();

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const handleRunCustomSql = () => {
    const res = db.executeSqlQuery(customSql);
    setQueryResult(res);
  };

  const setPresetSql = (sql: string) => {
    setCustomSql(sql);
    const res = db.executeSqlQuery(sql);
    setQueryResult(res);
    setActiveReport('CUSTOM');
  };

  // SQL Strings for each report
  const POPULAR_SQL = `SELECT 
    b.book_id,
    b.isbn,
    b.title,
    b.author,
    b.category,
    COUNT(t.transaction_id) AS total_borrows
FROM books b
LEFT JOIN borrow_transactions t ON b.book_id = t.book_id
GROUP BY b.book_id, b.isbn, b.title, b.author, b.category
ORDER BY total_borrows DESC, b.title ASC
LIMIT 8;`;

  const OVERDUE_SQL = `SELECT 
    m.member_id,
    m.name AS member_name,
    m.email,
    b.title AS book_title,
    t.issue_date,
    t.due_date,
    DATEDIFF(CURDATE(), t.due_date) AS days_overdue,
    ROUND(DATEDIFF(CURDATE(), t.due_date) * 0.50, 2) AS estimated_fine
FROM borrow_transactions t
JOIN members m ON t.member_id = m.member_id
JOIN books b ON t.book_id = b.book_id
WHERE t.return_date IS NULL AND t.due_date < CURDATE()
ORDER BY days_overdue DESC;`;

  const MONTHLY_SQL = `SELECT 
    DATE_FORMAT(issue_date, '%Y-%m') AS circulation_month,
    COUNT(*) AS total_issued,
    COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) AS total_returned,
    COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdue_unreturned,
    SUM(fine_amount) AS total_fines_accrued
FROM borrow_transactions
GROUP BY circulation_month
ORDER BY circulation_month DESC;`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Overview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Relational SQL Analytics Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            JOINs & Aggregate Circulation Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution of multi-table JOINs, GROUP BY, DATEDIFF, and COUNT aggregates on the normalized MySQL schema.
          </p>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setActiveReport('POPULAR')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeReport === 'POPULAR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Borrowed
          </button>
          <button
            onClick={() => setActiveReport('OVERDUE')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeReport === 'OVERDUE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue Members
          </button>
          <button
            onClick={() => setActiveReport('MONTHLY')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeReport === 'MONTHLY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Stats
          </button>
          <button
            onClick={() => setActiveReport('CUSTOM')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeReport === 'CUSTOM'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL Runner
          </button>
        </div>
      </div>

      {/* ================= REPORT 1: MOST BORROWED ================= */}
      {activeReport === 'POPULAR' && (
        <div className="space-y-6">
          {/* SQL Code Preview Block */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-slate-100 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>MySQL Query: LEFT JOIN + COUNT(*) + GROUP BY</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(POPULAR_SQL)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQuery ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setPresetSql(POPULAR_SQL)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Open in Runner</span>
                </button>
              </div>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              {POPULAR_SQL}
            </pre>
          </div>

          {/* Visual Rankings & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Ranking Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Borrowing Frequency Distribution</span>
              </h3>
              <div className="space-y-3 pt-2">
                {mostBorrowedData.map((item, idx) => {
                  const maxBorrows = mostBorrowedData[0]?.borrowCount || 1;
                  const percentage = Math.round((item.borrowCount / maxBorrows) * 100);

                  return (
                    <div key={item.bookId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {idx + 1}. {item.title}
                        </span>
                        <span className="font-mono font-bold text-indigo-600">
                          {item.borrowCount} loans
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(8, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Data Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Most Borrowed Catalog Books Table
                </h3>
                <span className="text-xs text-slate-500">Aggregate result</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Rank & Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4 font-mono">Total Borrows</th>
                      <th className="py-3 px-4 font-mono">In Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {mostBorrowedData.map((b, i) => (
                      <tr key={b.bookId} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <span className="inline-block w-5 text-slate-400 font-mono">#{i + 1}</span>
                          {b.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                            {b.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{b.author}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                          {b.borrowCount}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600">
                          {b.currentAvailable} / {b.totalCopies}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT 2: OVERDUE MEMBERS ================= */}
      {activeReport === 'OVERDUE' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-slate-100 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>MySQL Query: 3-Table JOIN + DATEDIFF() + Computed Fine</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(OVERDUE_SQL)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQuery ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setPresetSql(OVERDUE_SQL)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Open in Runner</span>
                </button>
              </div>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              {OVERDUE_SQL}
            </pre>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Overdue Borrowers & Fine Accruals
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated dynamically with rate of $0.50/day overdue
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {overdueMembersData.length} Overdue Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Member ID & Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4 font-mono">Due Date</th>
                    <th className="py-3 px-4 font-mono">Days Overdue</th>
                    <th className="py-3 px-4 font-mono">Accrued Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {overdueMembersData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No overdue members found. All borrowings are currently within due dates!
                      </td>
                    </tr>
                  ) : (
                    overdueMembersData.map((row) => (
                      <tr key={row.transactionId} className="hover:bg-rose-50/40">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {row.memberName}
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {row.memberId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {row.memberEmail}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {row.bookTitle}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {row.dueDate}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">
                          {row.daysOverdue} days
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-700 text-sm">
                          ${row.accruedFine.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT 3: MONTHLY CIRCULATION ================= */}
      {activeReport === 'MONTHLY' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 text-slate-100 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-indigo-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>MySQL Query: DATE_FORMAT() + Conditional COUNT(CASE) Aggregates</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(MONTHLY_SQL)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQuery ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setPresetSql(MONTHLY_SQL)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Open in Runner</span>
                </button>
              </div>
            </div>
            <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              {MONTHLY_SQL}
            </pre>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Circulation Statistics Breakdown
              </h3>
              <span className="text-xs text-slate-500">GROUP BY YYYY-MM</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Circulation Month</th>
                    <th className="py-3 px-4 font-mono">Total Issued</th>
                    <th className="py-3 px-4 font-mono">Total Returned</th>
                    <th className="py-3 px-4 font-mono">Overdue Unreturned</th>
                    <th className="py-3 px-4 font-mono">Total Fines Accrued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {monthlyData.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {m.month}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">
                        {m.issued}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">
                        {m.returned}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-rose-600">
                        {m.overdue}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${m.finesAccrued.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= CUSTOM SQL RUNNER ================= */}
      {activeReport === 'CUSTOM' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">MySQL Interactive Console (SQL Engine)</span>
              </div>

              {/* Presets dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Load Preset:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value === '1') setPresetSql(POPULAR_SQL);
                    if (e.target.value === '2') setPresetSql(OVERDUE_SQL);
                    if (e.target.value === '3') setPresetSql(MONTHLY_SQL);
                    if (e.target.value === '4') setPresetSql('SELECT * FROM books WHERE category = \'Computer Science\';');
                    if (e.target.value === '5') setPresetSql('SELECT * FROM members;');
                    if (e.target.value === '6') setPresetSql('SELECT * FROM borrow_transactions;');
                  }}
                  className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 focus:outline-none"
                >
                  <option value="">-- Choose SQL Query --</option>
                  <option value="1">Report: Most-Borrowed Books</option>
                  <option value="2">Report: Overdue Members & Fines</option>
                  <option value="3">Report: Monthly Circulation</option>
                  <option value="4">Query: CS Category Books</option>
                  <option value="5">Query: All Members Table</option>
                  <option value="6">Query: All Borrow Transactions</option>
                </select>
              </div>
            </div>

            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-normal leading-relaxed"
              placeholder="Enter custom SQL query (e.g. SELECT * FROM books...)"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Executes in-memory relational query with column projection & grouping
              </span>
              <button
                onClick={handleRunCustomSql}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute SQL</span>
              </button>
            </div>
          </div>

          {/* Query Results View */}
          {queryResult && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">Query Output</span>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {queryResult.rowCount} rows returned
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Time: {queryResult.queryTimeMs} ms
                  </span>
                </div>
              </div>

              {queryResult.error ? (
                <div className="p-4 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs font-mono">
                  Error: {queryResult.error}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th key={col} className="py-2.5 px-4 font-mono font-bold uppercase text-[11px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          {queryResult.columns.map((col) => (
                            <td key={col} className="py-2.5 px-4 font-mono text-[11px]">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
