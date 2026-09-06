import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, Sparkles, HelpCircle } from 'lucide-react';
import { db } from '../services/database';
import { Book, Member, BorrowTransaction } from '../types/library';

interface ConsoleLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

interface PythonConsoleProps {
  onRefreshData: () => void;
}

export const PythonConsole: React.FC<PythonConsoleProps> = ({ onRefreshData }) => {
  const [history, setHistory] = useState<ConsoleLine[]>([
    {
      type: 'info',
      text: 'Python 3.11.4 (main, LMS Runtime Environment) [GCC 11.2.0]',
    },
    {
      type: 'info',
      text: 'Loading MySQL connector & initializing normalized database schema...',
    },
    {
      type: 'success',
      text: 'Connection established to MySQL library_db (InnoDB). 3NF tables verified.',
    },
    {
      type: 'info',
      text: 'Type "help" to view all available console commands, or click the quick action chips below.',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    // Add to command history
    setCommandHistory((prev) => [...prev, raw]);
    setHistoryIdx(-1);

    const newLines: ConsoleLine[] = [{ type: 'input', text: `library-cli> ${raw}` }];
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    try {
      switch (cmd) {
        case 'help':
          newLines.push({
            type: 'info',
            text: `================== LIBRARY CLI COMMAND MANUAL ==================
books                          - List all books with current inventory copies
members                        - List all registered patrons and borrow quotas
search <keyword>               - Parameterized book search (title/author/category)
issue <book_id> <member_id>    - Issue book copy to member (e.g. issue B001 M002)
return <transaction_id>        - Return book & calculate overdue fine (e.g. return TRX-101)
report popular                 - Generate report on most-borrowed books (JOIN & COUNT)
report overdue                 - Generate report on overdue members & fines (DATEDIFF)
report monthly                 - Generate monthly circulation statistics
sql <query>                    - Execute custom SQL on database (e.g. sql SELECT * FROM books)
clear                          - Clear terminal screen
reset                          - Reset database to initial seed data`,
          });
          break;

        case 'clear':
          setHistory([]);
          setInputVal('');
          return;

        case 'reset':
          db.resetToDefaults();
          onRefreshData();
          newLines.push({
            type: 'success',
            text: 'Database successfully re-seeded to initial state.',
          });
          break;

        case 'books':
        case 'list-books': {
          const books = db.getBooks();
          let out = `BOOK_ID | TITLE (ISBN) | AVAIL/TOTAL | SHELF\n-------------------------------------------------------------`;
          books.forEach((b) => {
            out += `\n[${b.id}] ${b.title.substring(0, 32).padEnd(32)} | ${b.availableCopies}/${b.totalCopies} avail | ${b.shelfLocation}`;
          });
          newLines.push({ type: 'output', text: out });
          break;
        }

        case 'members':
        case 'list-members': {
          const members = db.getMembers();
          const trxs = db.getTransactions();
          let out = `MEMBER_ID | NAME | TYPE | QUOTA | STATUS\n-------------------------------------------------------------`;
          members.forEach((m) => {
            const activeCount = trxs.filter((t) => t.memberId === m.id && !t.returnDate).length;
            out += `\n[${m.id}] ${m.name.padEnd(20)} | ${m.type.padEnd(8)} | ${activeCount}/${m.maxBorrowLimit} books | ${m.status}`;
          });
          newLines.push({ type: 'output', text: out });
          break;
        }

        case 'search': {
          if (!arg1) {
            newLines.push({ type: 'error', text: 'Usage: search <keyword>' });
            break;
          }
          const term = parts.slice(1).join(' ').toLowerCase();
          const books = db.getBooks().filter(
            (b) =>
              b.title.toLowerCase().includes(term) ||
              b.author.toLowerCase().includes(term) ||
              b.category.toLowerCase().includes(term)
          );
          if (books.length === 0) {
            newLines.push({ type: 'output', text: `No books found matching "${term}".` });
          } else {
            let out = `Found ${books.length} matching books:\n-------------------------------------------------------------`;
            books.forEach((b) => {
              out += `\n[${b.id}] "${b.title}" by ${b.author} (${b.availableCopies} available)`;
            });
            newLines.push({ type: 'output', text: out });
          }
          break;
        }

        case 'issue': {
          if (!arg1 || !arg2) {
            newLines.push({ type: 'error', text: 'Usage: issue <book_id> <member_id> (e.g. issue B002 M001)' });
            break;
          }
          const res = db.issueBook({ bookId: arg1.toUpperCase(), memberId: arg2.toUpperCase() });
          if (res.success) {
            onRefreshData();
            newLines.push({
              type: 'success',
              text: `SUCCESS: Transaction ${res.transaction?.id} created. Book ${arg1.toUpperCase()} issued to member ${arg2.toUpperCase()}. Due date: ${res.transaction?.dueDate}. Inventory decremented.`,
            });
          } else {
            newLines.push({ type: 'error', text: `ERROR: ${res.error}` });
          }
          break;
        }

        case 'return': {
          if (!arg1) {
            newLines.push({ type: 'error', text: 'Usage: return <transaction_id> (e.g. return TRX-101)' });
            break;
          }
          const res = db.returnBook({ transactionId: arg1.toUpperCase(), markFinePaid: true });
          if (res.success) {
            onRefreshData();
            newLines.push({
              type: 'success',
              text: `SUCCESS: Book return completed. Transaction ${arg1.toUpperCase()} closed. Overdue fine: $${res.fine?.toFixed(2) ?? '0.00'}. Copy restored to inventory.`,
            });
          } else {
            newLines.push({ type: 'error', text: `ERROR: ${res.error}` });
          }
          break;
        }

        case 'report': {
          if (arg1 === 'popular') {
            const data = db.reportMostBorrowedBooks(6);
            let out = `RANK | TITLE | BORROW_COUNT | IN_STOCK\n-------------------------------------------------------------`;
            data.forEach((d, i) => {
              out += `\n#${i + 1} | ${d.title.substring(0, 30).padEnd(30)} | ${d.borrowCount} loans | ${d.currentAvailable}/${d.totalCopies}`;
            });
            newLines.push({ type: 'output', text: out });
          } else if (arg1 === 'overdue') {
            const data = db.reportOverdueMembers();
            if (data.length === 0) {
              newLines.push({ type: 'output', text: 'No overdue members found.' });
            } else {
              let out = `MEMBER | BOOK TITLE | DUE_DATE | DAYS_OVERDUE | FINE\n-------------------------------------------------------------`;
              data.forEach((d) => {
                out += `\n${d.memberName.padEnd(16)} | ${d.bookTitle.substring(0, 20).padEnd(20)} | ${d.dueDate} | ${d.daysOverdue} days | $${d.accruedFine.toFixed(2)}`;
              });
              newLines.push({ type: 'output', text: out });
            }
          } else if (arg1 === 'monthly') {
            const data = db.reportMonthlyCirculation();
            let out = `MONTH | ISSUED | RETURNED | OVERDUE | FINES ACCRUED\n-------------------------------------------------------------`;
            data.forEach((d) => {
              out += `\n${d.month} | ${d.issued} loans | ${d.returned} ret | ${d.overdue} over | $${d.finesAccrued.toFixed(2)}`;
            });
            newLines.push({ type: 'output', text: out });
          } else {
            newLines.push({ type: 'error', text: 'Usage: report [popular | overdue | monthly]' });
          }
          break;
        }

        case 'sql': {
          const sqlQuery = parts.slice(1).join(' ');
          if (!sqlQuery) {
            newLines.push({ type: 'error', text: 'Usage: sql <query>' });
            break;
          }
          const res = db.executeSqlQuery(sqlQuery);
          if (res.error) {
            newLines.push({ type: 'error', text: `SQL Error: ${res.error}` });
          } else {
            let out = `(${res.rowCount} rows in ${res.queryTimeMs} ms)\n` + res.columns.join(' | ') + '\n' + '-'.repeat(55);
            res.rows.forEach((r) => {
              out += '\n' + res.columns.map((c) => String(r[c] ?? 'NULL')).join(' | ');
            });
            newLines.push({ type: 'output', text: out });
          }
          break;
        }

        default:
          newLines.push({
            type: 'error',
            text: `Command not recognized: "${cmd}". Type "help" for instructions.`,
          });
      }
    } catch (err: any) {
      newLines.push({ type: 'error', text: `Runtime Exception: ${err.message}` });
    }

    setHistory((prev) => [...prev, ...newLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIdx + 1 < commandHistory.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Chips Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Commands:</span>
        </span>
        <button
          onClick={() => handleCommand('help')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md font-mono"
        >
          help
        </button>
        <button
          onClick={() => handleCommand('books')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md font-mono"
        >
          books
        </button>
        <button
          onClick={() => handleCommand('members')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md font-mono"
        >
          members
        </button>
        <button
          onClick={() => handleCommand('report popular')}
          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-md font-mono"
        >
          report popular
        </button>
        <button
          onClick={() => handleCommand('report overdue')}
          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-md font-mono"
        >
          report overdue
        </button>
        <button
          onClick={() => handleCommand('report monthly')}
          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md font-mono"
        >
          report monthly
        </button>
        <button
          onClick={() => handleCommand('clear')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md font-mono ml-auto"
        >
          clear
        </button>
      </div>

      {/* Terminal Canvas */}
      <div
        className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs flex flex-col min-h-[500px]"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-300 ml-2 font-mono">
              python library_system.py (Console OOP Interface)
            </span>
          </div>
          <span className="text-[10px] text-slate-500">MySQL InnoDB Connected</span>
        </div>

        {/* Scrollable Terminal Output */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[550px]">
          {history.map((line, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap leading-relaxed ${
                line.type === 'input'
                  ? 'text-indigo-300 font-semibold'
                  : line.type === 'error'
                  ? 'text-rose-400'
                  : line.type === 'success'
                  ? 'text-emerald-400'
                  : line.type === 'info'
                  ? 'text-slate-400 italic'
                  : 'text-slate-200'
              }`}
            >
              {line.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Command Input Prompt */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center gap-2">
          <span className="text-emerald-400 font-bold select-none">library-cli&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Type a command (e.g. 'help', 'books', 'report popular')..."
            className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-600 font-mono text-xs"
          />
          <button
            onClick={() => handleCommand(inputVal)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
