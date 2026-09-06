import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BooksCatalog } from './components/BooksCatalog';
import { MembersDirectory } from './components/MembersDirectory';
import { IssueReturnDesk } from './components/IssueReturnDesk';
import { TransactionsTable } from './components/TransactionsTable';
import { SqlReports } from './components/SqlReports';
import { OopArchitecture } from './components/OopArchitecture';
import { PythonConsole } from './components/PythonConsole';
import { PythonScriptModal } from './components/PythonScriptModal';
import { db } from './services/database';
import { Book, Member, BorrowTransaction, SystemStats } from './types/library';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    issuedCopies: 0,
    totalMembers: 0,
    activeMembers: 0,
    activeBorrowings: 0,
    overdueCount: 0,
    totalFinesCollected: 0,
    pendingFines: 0,
  });

  const [preselectedBookId, setPreselectedBookId] = useState<string | undefined>(undefined);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Sync state from database service
  const refreshData = () => {
    setBooks(db.getBooks());
    setMembers(db.getMembers());
    setTransactions(db.getTransactions());
    setStats(db.getStats());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // CRUD Handlers
  const handleAddBook = (bookData: Omit<Book, 'id' | 'availableCopies'>) => {
    const res = db.addBook(bookData);
    if (res.success) refreshData();
    return res;
  };

  const handleUpdateBook = (id: string, updates: Partial<Book>) => {
    const res = db.updateBook(id, updates);
    if (res.success) refreshData();
    return res;
  };

  const handleDeleteBook = (id: string) => {
    const res = db.deleteBook(id);
    if (res.success) refreshData();
    return res;
  };

  const handleAddMember = (memberData: Omit<Member, 'id' | 'joinDate'>) => {
    const res = db.addMember(memberData);
    if (res.success) refreshData();
    return res;
  };

  const handleIssueBook = (params: {
    bookId: string;
    memberId: string;
    durationDays: number;
    issueDateStr?: string;
  }) => {
    const res = db.issueBook(params);
    if (res.success) refreshData();
    return res;
  };

  const handleReturnBook = (params: {
    transactionId: string;
    returnDateStr?: string;
    markFinePaid: boolean;
  }) => {
    const res = db.returnBook(params);
    if (res.success) refreshData();
    return res;
  };

  const handlePayFine = (transactionId: string) => {
    const res = db.payFine(transactionId);
    if (res.success) refreshData();
  };

  const handleResetData = () => {
    if (confirm('Reset entire library database back to initial seed state?')) {
      db.resetToDefaults();
      refreshData();
    }
  };

  const handleExportSql = () => {
    const sql = db.generateSqlDdl();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'library_management_system.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleIssueBookDirect = (book: Book) => {
    setPreselectedBookId(book.id);
    setActiveTab('issue-return');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          onResetData={handleResetData}
          onExportSql={handleExportSql}
          onViewPythonScript={() => setIsPythonModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-0 flex flex-col gap-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              books={books}
              members={members}
              transactions={transactions}
              onNavigate={(tab) => setActiveTab(tab)}
              onQuickIssue={() => setActiveTab('issue-return')}
              onQuickReturn={() => setActiveTab('issue-return')}
              onQuickAddBook={() => setActiveTab('books')}
            />
          )}

          {activeTab === 'books' && (
            <BooksCatalog
              books={books}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              onIssueBookDirect={handleIssueBookDirect}
            />
          )}

          {activeTab === 'members' && (
            <MembersDirectory
              members={members}
              transactions={transactions}
              books={books}
              onAddMember={handleAddMember}
            />
          )}

          {activeTab === 'issue-return' && (
            <IssueReturnDesk
              books={books}
              members={members}
              transactions={transactions}
              initialSelectedBookId={preselectedBookId}
              onIssueBook={handleIssueBook}
              onReturnBook={handleReturnBook}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTable
              transactions={transactions}
              books={books}
              members={members}
              onPayFine={handlePayFine}
            />
          )}

          {activeTab === 'sql-reports' && <SqlReports />}

          {activeTab === 'oop-architecture' && <OopArchitecture />}

          {activeTab === 'terminal' && <PythonConsole onRefreshData={refreshData} />}
        </main>
      </div>

      {/* Python Code Viewer Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
