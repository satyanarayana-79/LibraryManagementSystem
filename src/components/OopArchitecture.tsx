import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Code2,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Lock,
  Unlock,
} from 'lucide-react';

export const OopArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLASSES' | 'SECURITY' | 'SCHEMA'>('CLASSES');
  const [selectedClass, setSelectedClass] = useState<'Book' | 'Member' | 'BorrowTransaction' | 'LibraryDatabase'>('Book');

  // SQL Injection Interactive Test State
  const [injectionPayload, setInjectionPayload] = useState<string>("' OR '1'='1");

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Pill Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Python OOP & MySQL Architecture</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Object-Oriented Design & Query Parameterization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Encapsulated models, relational foreign key integrity, and SQL injection prevention.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('CLASSES')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'CLASSES'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OOP Class Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'SECURITY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL Injection Demo
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'SCHEMA'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Foreign Key Integrity (3NF)
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OOP CLASSES ================= */}
      {activeTab === 'CLASSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Python Model Class
            </h3>

            <button
              onClick={() => setSelectedClass('Book')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                selectedClass === 'Book'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-indigo-700">class Book</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">Model</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Encapsulates physical book catalog, inventory copies, and loan availability logic.
              </p>
            </button>

            <button
              onClick={() => setSelectedClass('Member')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                selectedClass === 'Member'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-indigo-700">class Member</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">Model</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Encapsulates member status, quota limits, and loan eligibility validation.
              </p>
            </button>

            <button
              onClick={() => setSelectedClass('BorrowTransaction')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                selectedClass === 'BorrowTransaction'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-indigo-700">class BorrowTransaction</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">Workflow</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Handles circulation lifecycle, due dates, and automated overdue fine calculations.
              </p>
            </button>

            <button
              onClick={() => setSelectedClass('LibraryDatabase')}
              className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                selectedClass === 'LibraryDatabase'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-indigo-700">class LibraryDatabase</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">Service</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                MySQL connector manager, parameterized query execution, transactions, and aggregate reports.
              </p>
            </button>
          </div>

          {/* Class Code & UML Details */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-5 text-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-mono font-semibold text-white">
                    Python Class Specification: {selectedClass}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">OOP Encapsulation</span>
              </div>

              {selectedClass === 'Book' && (
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`class Book:
    """Models a physical or catalog book."""
    def __init__(self, book_id: str, isbn: str, title: str, author: str,
                 category: str, total_copies: int, available_copies: int,
                 shelf_location: str, publication_year: int):
        self.id = book_id
        self.isbn = isbn
        self.title = title
        self.author = author
        self.category = category
        self.total_copies = total_copies
        self.available_copies = available_copies
        self.shelf_location = shelf_location
        self.publication_year = publication_year

    def is_available(self) -> bool:
        """Check if at least one copy is currently in stock."""
        return self.available_copies > 0

    def borrow_copy(self) -> bool:
        """Decrement inventory available copies when issued."""
        if self.is_available():
            self.available_copies -= 1
            return True
        return False

    def return_copy(self) -> bool:
        """Increment available copies when returned."""
        if self.available_copies < self.total_copies:
            self.available_copies += 1
            return True
        return False`}
                </pre>
              )}

              {selectedClass === 'Member' && (
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`class Member:
    """Models a library patron with quota controls."""
    def __init__(self, member_id: str, name: str, email: str, phone: str,
                 member_type: str = "Student", max_borrow_limit: int = 3,
                 status: str = "Active"):
        self.id = member_id
        self.name = name
        self.email = email
        self.phone = phone
        self.member_type = member_type
        self.max_borrow_limit = max_borrow_limit
        self.status = status
        self.active_borrows = []

    def can_borrow(self) -> Tuple[bool, str]:
        """Enforce business rules & referential constraints."""
        if self.status != "Active":
            return False, f"Member account is {self.status}."
        if len(self.active_borrows) >= self.max_borrow_limit:
            return False, f"Maximum borrow limit ({self.max_borrow_limit}) reached."
        return True, "Eligible"`}
                </pre>
              )}

              {selectedClass === 'BorrowTransaction' && (
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`class BorrowTransaction:
    """Models a borrowing transaction with automated fine calculation."""
    DAILY_FINE_RATE = 0.50  # $0.50 per overdue day

    def __init__(self, transaction_id: str, book_id: str, member_id: str,
                 issue_date: date, due_date: date, return_date: Optional[date] = None,
                 fine_amount: float = 0.0, status: str = "ISSUED"):
        self.id = transaction_id
        self.book_id = book_id
        self.member_id = member_id
        self.issue_date = issue_date
        self.due_date = due_date
        self.return_date = return_date
        self.fine_amount = fine_amount
        self.status = status

    def calculate_fine(self, current_date: Optional[date] = None) -> float:
        """Automated fine calculation formula."""
        target_date = self.return_date or current_date or date.today()
        if target_date > self.due_date:
            days_overdue = (target_date - self.due_date).days
            return round(days_overdue * self.DAILY_FINE_RATE, 2)
        return 0.0`}
                </pre>
              )}

              {selectedClass === 'LibraryDatabase' && (
                <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`class LibraryDatabase:
    """Database Access Object with MySQL Connector & Parameterized Queries."""
    def issue_book(self, trx_id: str, book_id: str, member_id: str, days: int = 14):
        conn = self.get_connection()
        try:
            conn.start_transaction()
            cursor = conn.cursor()
            
            # 1. Parameterized check to prevent SQL injection
            cursor.execute("SELECT available_copies FROM books WHERE book_id = %s", (book_id,))
            book = cursor.fetchone()
            if not book or book[0] <= 0:
                raise ValueError("Book unavailable.")

            # 2. Insert transaction record
            cursor.execute(
                "INSERT INTO borrow_transactions VALUES (%s, %s, %s, %s, %s, NULL, 0, FALSE, 'ISSUED')",
                (trx_id, book_id, member_id, date.today(), date.today() + timedelta(days=days))
            )
            # 3. Decrement inventory
            cursor.execute("UPDATE books SET available_copies = available_copies - 1 WHERE book_id = %s", (book_id,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e`}
                </pre>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Fully conforms to Python PEP 8 & type hinting guidelines.</span>
              <span className="font-mono text-indigo-400">InnoDB ACID Transactions</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SQL INJECTION DEMO ================= */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Why Parameterized Queries Prevent SQL Injection</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Testing user input against string concatenation vs. MySQL Connector parameterized tuples (`%s`).
              </p>
            </div>

            {/* Interactive Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Simulate Malicious Patron Input (Search query or Login ID):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={injectionPayload}
                  onChange={(e) => setInjectionPayload(e.target.value)}
                  className="flex-1 font-mono text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => setInjectionPayload("' OR '1'='1")}
                  className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono"
                >
                  Payload 1
                </button>
                <button
                  onClick={() => setInjectionPayload("admin' --")}
                  className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono"
                >
                  Payload 2
                </button>
                <button
                  onClick={() => setInjectionPayload("test'; DROP TABLE books; --")}
                  className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono"
                >
                  Payload 3
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Vulnerable Approach */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Vulnerable: String Formatting (f-string)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-bold">
                    CATASTROPHIC
                  </span>
                </div>

                <div className="font-mono text-xs bg-white p-3 rounded-lg border border-rose-200 text-slate-800 space-y-2">
                  <p className="text-slate-500 text-[11px]"># Python code:</p>
                  <code className="text-rose-600 block">
                    query = f"SELECT * FROM members WHERE email = '{injectionPayload}'"
                  </code>
                </div>

                <div className="font-mono text-xs bg-slate-900 p-3 rounded-lg text-rose-400 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Executed by MySQL Server:</span>
                  <p className="break-all">
                    SELECT * FROM members WHERE email = '{injectionPayload}'
                  </p>
                </div>

                <p className="text-xs text-rose-700">
                  ⚠️ <strong>Result:</strong> SQL structure is altered! The condition resolves to <code>TRUE</code>, dumping unauthorized member records or executing destructive statements.
                </p>
              </div>

              {/* Secure Approach */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Secure: Parameterized (%s Tuple)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    PROTECTED
                  </span>
                </div>

                <div className="font-mono text-xs bg-white p-3 rounded-lg border border-emerald-200 text-slate-800 space-y-2">
                  <p className="text-slate-500 text-[11px]"># Python code:</p>
                  <code className="text-emerald-700 block">
                    cursor.execute("SELECT * FROM members WHERE email = %s", (user_input,))
                  </code>
                </div>

                <div className="font-mono text-xs bg-slate-900 p-3 rounded-lg text-emerald-400 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Treated by MySQL Connector:</span>
                  <p className="break-all text-slate-200">
                    Input is safely sent through the binary protocol as a literal string parameter. Quotes and semicolons are escaped.
                  </p>
                </div>

                <p className="text-xs text-emerald-800">
                  ✅ <strong>Result:</strong> Zero SQL syntax modification. The engine searches for an email literally containing the exact characters. 100% immune to SQL injection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: 3NF RELATIONAL SCHEMA ================= */}
      {activeTab === 'SCHEMA' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Normalized Relational Schema & Foreign Keys</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                3rd Normal Form (3NF) relational design eliminating redundancy and enforcing referential integrity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Table 1: books */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono font-bold text-xs">TABLE: books</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">InnoDB</span>
              </div>
              <div className="p-3 text-xs space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-indigo-600">PK: book_id</span>
                  <span className="text-slate-400 text-[11px]">VARCHAR(10)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-700">UQ: isbn</span>
                  <span className="text-slate-400 text-[11px]">VARCHAR(20)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>title</span>
                  <span className="text-slate-400 font-mono text-[11px]">VARCHAR(255)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>author</span>
                  <span className="text-slate-400 font-mono text-[11px]">VARCHAR(255)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>total_copies</span>
                  <span className="text-slate-400 font-mono text-[11px]">INT UNSIGNED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>available_copies</span>
                  <span className="text-slate-400 font-mono text-[11px]">INT UNSIGNED</span>
                </div>
              </div>
            </div>

            {/* Table 2: members */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono font-bold text-xs">TABLE: members</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">InnoDB</span>
              </div>
              <div className="p-3 text-xs space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-indigo-600">PK: member_id</span>
                  <span className="text-slate-400 text-[11px]">VARCHAR(10)</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-slate-700">UQ: email</span>
                  <span className="text-slate-400 text-[11px]">VARCHAR(150)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>name</span>
                  <span className="text-slate-400 font-mono text-[11px]">VARCHAR(150)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>member_type</span>
                  <span className="text-slate-400 font-mono text-[11px]">ENUM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>max_borrow_limit</span>
                  <span className="text-slate-400 font-mono text-[11px]">INT UNSIGNED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>status</span>
                  <span className="text-slate-400 font-mono text-[11px]">ENUM</span>
                </div>
              </div>
            </div>

            {/* Table 3: borrow_transactions */}
            <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-indigo-900 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono font-bold text-xs">TABLE: borrow_transactions</span>
                <span className="text-[10px] bg-indigo-800 px-1.5 py-0.5 rounded font-mono">InnoDB</span>
              </div>
              <div className="p-3 text-xs space-y-2 bg-indigo-50/30">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-indigo-600">PK: transaction_id</span>
                  <span className="text-slate-400 text-[11px]">VARCHAR(15)</span>
                </div>
                <div className="flex items-center justify-between font-mono bg-indigo-100/50 p-1 rounded">
                  <span className="font-bold text-indigo-800">FK: book_id &rarr; books</span>
                  <span className="text-[10px] font-sans text-indigo-600">ON DELETE RESTRICT</span>
                </div>
                <div className="flex items-center justify-between font-mono bg-indigo-100/50 p-1 rounded">
                  <span className="font-bold text-indigo-800">FK: member_id &rarr; members</span>
                  <span className="text-[10px] font-sans text-indigo-600">ON DELETE RESTRICT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>issue_date / due_date</span>
                  <span className="text-slate-400 font-mono text-[11px]">DATE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>return_date</span>
                  <span className="text-slate-400 font-mono text-[11px]">DATE NULL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>fine_amount</span>
                  <span className="text-slate-400 font-mono text-[11px]">DECIMAL(6,2)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
