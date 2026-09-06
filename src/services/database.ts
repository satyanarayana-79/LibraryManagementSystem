import { Book, Member, BorrowTransaction, SystemStats, SqlQueryResult } from '../types/library';
import { INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'lms_books_v1',
  MEMBERS: 'lms_members_v1',
  TRANSACTIONS: 'lms_transactions_v1',
};

export const DAILY_FINE_RATE = 0.50; // $0.50 per day

class LibraryDatabaseService {
  private books: Book[] = [];
  private members: Member[] = [];
  private transactions: BorrowTransaction[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
      const savedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      const savedTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (savedBooks && savedMembers && savedTrx) {
        this.books = JSON.parse(savedBooks);
        this.members = JSON.parse(savedMembers);
        this.transactions = JSON.parse(savedTrx);
        this.updateOverdueStatus();
      } else {
        this.resetToDefaults();
      }
    } catch {
      this.resetToDefaults();
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(this.books));
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public resetToDefaults() {
    this.books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
    this.members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.updateOverdueStatus();
    this.saveState();
  }

  public updateOverdueStatus(currentDateStr?: string) {
    const today = currentDateStr ? new Date(currentDateStr) : new Date();
    today.setHours(0, 0, 0, 0);

    this.transactions.forEach((trx) => {
      if (!trx.returnDate) {
        const dueDate = new Date(trx.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (today > dueDate) {
          trx.status = 'OVERDUE';
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          trx.fineAmount = Number((diffDays * DAILY_FINE_RATE).toFixed(2));
        } else {
          trx.status = 'ISSUED';
        }
      }
    });
  }

  // --- QUERY APIS ---

  public getBooks(): Book[] {
    return [...this.books];
  }

  public getBookById(id: string): Book | undefined {
    return this.books.find((b) => b.id === id);
  }

  public getMembers(): Member[] {
    return [...this.members];
  }

  public getMemberById(id: string): Member | undefined {
    return this.members.find((m) => m.id === id);
  }

  public getTransactions(): BorrowTransaction[] {
    return [...this.transactions];
  }

  public getStats(): SystemStats {
    const totalBooks = this.books.length;
    const totalCopies = this.books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCopies = this.books.reduce((sum, b) => sum + b.availableCopies, 0);
    const issuedCopies = totalCopies - availableCopies;

    const totalMembers = this.members.length;
    const activeMembers = this.members.filter((m) => m.status === 'Active').length;

    const activeBorrowings = this.transactions.filter((t) => !t.returnDate).length;
    const overdueCount = this.transactions.filter((t) => t.status === 'OVERDUE').length;

    const totalFinesCollected = this.transactions
      .filter((t) => t.finePaid)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    const pendingFines = this.transactions
      .filter((t) => !t.finePaid && t.fineAmount > 0)
      .reduce((sum, t) => sum + t.fineAmount, 0);

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      issuedCopies,
      totalMembers,
      activeMembers,
      activeBorrowings,
      overdueCount,
      totalFinesCollected: Number(totalFinesCollected.toFixed(2)),
      pendingFines: Number(pendingFines.toFixed(2)),
    };
  }

  // --- CRUD OPERATIONS ---

  public addBook(bookData: Omit<Book, 'id' | 'availableCopies'>): { success: boolean; error?: string; book?: Book } {
    // Check ISBN uniqueness (Referential & unique constraint)
    if (this.books.some((b) => b.isbn.trim() === bookData.isbn.trim())) {
      return { success: false, error: `A book with ISBN '${bookData.isbn}' already exists.` };
    }

    const nextNum = this.books.length + 1;
    const id = `B${String(nextNum).padStart(3, '0')}`;

    const newBook: Book = {
      ...bookData,
      id,
      availableCopies: bookData.totalCopies,
    };

    this.books.push(newBook);
    this.saveState();
    return { success: true, book: newBook };
  }

  public updateBook(id: string, updates: Partial<Book>): { success: boolean; error?: string } {
    const index = this.books.findIndex((b) => b.id === id);
    if (index === -1) return { success: false, error: 'Book not found.' };

    // Check ISBN conflict
    if (updates.isbn && this.books.some((b) => b.isbn === updates.isbn && b.id !== id)) {
      return { success: false, error: `ISBN '${updates.isbn}' is used by another book.` };
    }

    const existing = this.books[index];
    const diffCopies = (updates.totalCopies ?? existing.totalCopies) - existing.totalCopies;
    const newAvailable = Math.max(0, existing.availableCopies + diffCopies);

    this.books[index] = {
      ...existing,
      ...updates,
      availableCopies: newAvailable,
    };

    this.saveState();
    return { success: true };
  }

  public deleteBook(id: string): { success: boolean; error?: string } {
    // Check foreign key constraint: cannot delete if active borrowing exists
    const hasActiveBorrow = this.transactions.some((t) => t.bookId === id && !t.returnDate);
    if (hasActiveBorrow) {
      return {
        success: false,
        error: `MySQL Foreign Key Constraint: Cannot delete book '${id}' because active borrowing records exist.`,
      };
    }

    this.books = this.books.filter((b) => b.id !== id);
    this.saveState();
    return { success: true };
  }

  public addMember(memberData: Omit<Member, 'id' | 'joinDate'>): { success: boolean; error?: string; member?: Member } {
    // Unique email check
    if (this.members.some((m) => m.email.toLowerCase() === memberData.email.toLowerCase())) {
      return { success: false, error: `Member with email '${memberData.email}' already exists.` };
    }

    const nextNum = this.members.length + 1;
    const id = `M${String(nextNum).padStart(3, '0')}`;

    const todayStr = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      ...memberData,
      id,
      joinDate: todayStr,
    };

    this.members.push(newMember);
    this.saveState();
    return { success: true, member: newMember };
  }

  // --- WORKFLOW: ISSUE BOOK ---

  public issueBook(params: {
    bookId: string;
    memberId: string;
    durationDays?: number;
    issueDateStr?: string;
  }): { success: boolean; error?: string; transaction?: BorrowTransaction } {
    const { bookId, memberId, durationDays = 14, issueDateStr } = params;

    const book = this.books.find((b) => b.id === bookId);
    if (!book) {
      return { success: false, error: `Referential Integrity Error: Book '${bookId}' does not exist.` };
    }

    if (book.availableCopies <= 0) {
      return { success: false, error: `Stock Unavailable: No copies of '${book.title}' available in inventory.` };
    }

    const member = this.members.find((m) => m.id === memberId);
    if (!member) {
      return { success: false, error: `Referential Integrity Error: Member '${memberId}' does not exist.` };
    }

    if (member.status !== 'Active') {
      return { success: false, error: `Account Status: Member account is currently ${member.status}.` };
    }

    // Check active borrows count against max borrow limit
    const activeBorrows = this.transactions.filter((t) => t.memberId === memberId && !t.returnDate);
    if (activeBorrows.length >= member.maxBorrowLimit) {
      return {
        success: false,
        error: `Borrow Limit Exceeded: Member has ${activeBorrows.length} of max allowed ${member.maxBorrowLimit} books checked out.`,
      };
    }

    // Date calculations
    const issueDate = issueDateStr ? new Date(issueDateStr) : new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + durationDays);

    const issueDateFmt = issueDate.toISOString().split('T')[0];
    const dueDateFmt = dueDate.toISOString().split('T')[0];

    const nextTrxNum = this.transactions.length + 101;
    const trxId = `TRX-${nextTrxNum}`;

    const newTrx: BorrowTransaction = {
      id: trxId,
      bookId,
      memberId,
      issueDate: issueDateFmt,
      dueDate: dueDateFmt,
      returnDate: null,
      fineAmount: 0,
      finePaid: false,
      status: 'ISSUED',
    };

    // Atomic update: decrease inventory and log transaction
    book.availableCopies -= 1;
    this.transactions.unshift(newTrx);
    this.saveState();

    return { success: true, transaction: newTrx };
  }

  // --- WORKFLOW: RETURN BOOK ---

  public returnBook(params: {
    transactionId: string;
    returnDateStr?: string;
    markFinePaid?: boolean;
  }): { success: boolean; error?: string; fine?: number; transaction?: BorrowTransaction } {
    const { transactionId, returnDateStr, markFinePaid = false } = params;

    const trx = this.transactions.find((t) => t.id === transactionId);
    if (!trx) {
      return { success: false, error: `Transaction '${transactionId}' not found.` };
    }

    if (trx.returnDate) {
      return { success: false, error: `Book was already returned on ${trx.returnDate}.` };
    }

    const returnDate = returnDateStr ? new Date(returnDateStr) : new Date();
    returnDate.setHours(0, 0, 0, 0);

    const dueDate = new Date(trx.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    let fine = 0;
    if (returnDate > dueDate) {
      const diffTime = returnDate.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = Number((diffDays * DAILY_FINE_RATE).toFixed(2));
    }

    trx.returnDate = returnDate.toISOString().split('T')[0];
    trx.fineAmount = fine;
    trx.finePaid = fine > 0 ? markFinePaid : true;
    trx.status = 'RETURNED';

    // Atomic update: increment available copies
    const book = this.books.find((b) => b.id === trx.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    this.saveState();
    return { success: true, fine, transaction: trx };
  }

  public payFine(transactionId: string): { success: boolean; error?: string } {
    const trx = this.transactions.find((t) => t.id === transactionId);
    if (!trx) return { success: false, error: 'Transaction not found.' };

    trx.finePaid = true;
    this.saveState();
    return { success: true };
  }

  // --- ANALYTICAL REPORTS (JOINs and AGGREGATE SQL EMULATION) ---

  public reportMostBorrowedBooks(limit = 6) {
    // JOIN books b LEFT JOIN borrow_transactions t ON b.id = t.bookId
    // GROUP BY b.id ORDER BY borrow_count DESC
    const borrowCounts: Record<string, number> = {};
    this.transactions.forEach((t) => {
      borrowCounts[t.bookId] = (borrowCounts[t.bookId] || 0) + 1;
    });

    const report = this.books.map((b) => {
      const count = borrowCounts[b.id] || 0;
      return {
        bookId: b.id,
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        category: b.category,
        borrowCount: count,
        currentAvailable: b.availableCopies,
        totalCopies: b.totalCopies,
      };
    });

    report.sort((a, b) => b.borrowCount - a.borrowCount || a.title.localeCompare(b.title));
    return report.slice(0, limit);
  }

  public reportOverdueMembers() {
    // JOIN borrow_transactions t JOIN members m JOIN books b
    // WHERE return_date IS NULL AND due_date < NOW()
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdues = this.transactions.filter((t) => {
      if (t.returnDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return today > due;
    });

    return overdues.map((t) => {
      const member = this.members.find((m) => m.id === t.memberId);
      const book = this.books.find((b) => b.id === t.bookId);
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      const fine = Number((daysOverdue * DAILY_FINE_RATE).toFixed(2));

      return {
        transactionId: t.id,
        memberId: t.memberId,
        memberName: member ? member.name : 'Unknown Member',
        memberEmail: member ? member.email : '',
        bookId: t.bookId,
        bookTitle: book ? book.title : 'Unknown Book',
        issueDate: t.issueDate,
        dueDate: t.dueDate,
        daysOverdue,
        accruedFine: fine,
      };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  public reportMonthlyCirculation() {
    // GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
    const monthlyMap: Record<string, { month: string; issued: number; returned: number; overdue: number; finesAccrued: number }> = {};

    this.transactions.forEach((t) => {
      const monthKey = t.issueDate.substring(0, 7); // "YYYY-MM"
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          issued: 0,
          returned: 0,
          overdue: 0,
          finesAccrued: 0,
        };
      }

      monthlyMap[monthKey].issued += 1;
      if (t.returnDate) {
        monthlyMap[monthKey].returned += 1;
      }
      if (t.status === 'OVERDUE') {
        monthlyMap[monthKey].overdue += 1;
      }
      monthlyMap[monthKey].finesAccrued += t.fineAmount;
    });

    const list = Object.values(monthlyMap);
    list.sort((a, b) => a.month.localeCompare(b.month));
    return list;
  }

  // --- SQL QUERY RUNNER FOR CUSTOM OR TEMPLATED QUERIES ---

  public executeSqlQuery(rawQuery: string): SqlQueryResult {
    const startTime = performance.now();
    const cleanSql = rawQuery.trim();

    try {
      // 1. Most Borrowed query
      if (/most.*borrow|count\(.*transaction/i.test(cleanSql)) {
        const rows = this.reportMostBorrowedBooks(10).map((r) => ({
          book_id: r.bookId,
          isbn: r.isbn,
          title: r.title,
          author: r.author,
          category: r.category,
          borrow_count: r.borrowCount,
          available_copies: r.currentAvailable,
        }));
        return {
          columns: ['book_id', 'isbn', 'title', 'author', 'category', 'borrow_count', 'available_copies'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // 2. Overdue Members query
      if (/overdue|datediff/i.test(cleanSql)) {
        const rows = this.reportOverdueMembers().map((r) => ({
          member_id: r.memberId,
          member_name: r.memberName,
          email: r.memberEmail,
          book_title: r.bookTitle,
          due_date: r.dueDate,
          days_overdue: r.daysOverdue,
          fine_usd: `$${r.accruedFine.toFixed(2)}`,
        }));
        return {
          columns: ['member_id', 'member_name', 'email', 'book_title', 'due_date', 'days_overdue', 'fine_usd'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // 3. Monthly Circulation
      if (/monthly|circulation|date_format/i.test(cleanSql)) {
        const rows = this.reportMonthlyCirculation().map((r) => ({
          month: r.month,
          total_issued: r.issued,
          total_returned: r.returned,
          overdue_active: r.overdue,
          total_fines_usd: `$${r.finesAccrued.toFixed(2)}`,
        }));
        return {
          columns: ['month', 'total_issued', 'total_returned', 'overdue_active', 'total_fines_usd'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // 4. SELECT * FROM books
      if (/select.*from\s+books/i.test(cleanSql)) {
        let list = this.books;
        // Check simple category WHERE filter
        const matchCat = cleanSql.match(/category\s*=\s*['"]([^'"]+)['"]/i);
        if (matchCat) {
          list = list.filter((b) => b.category.toLowerCase() === matchCat[1].toLowerCase());
        }
        const rows = list.map((b) => ({
          book_id: b.id,
          isbn: b.isbn,
          title: b.title,
          author: b.author,
          category: b.category,
          total_copies: b.totalCopies,
          available_copies: b.availableCopies,
          shelf_location: b.shelfLocation,
        }));
        return {
          columns: ['book_id', 'isbn', 'title', 'author', 'category', 'total_copies', 'available_copies', 'shelf_location'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // 5. SELECT * FROM members
      if (/select.*from\s+members/i.test(cleanSql)) {
        const rows = this.members.map((m) => ({
          member_id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          type: m.type,
          max_limit: m.maxBorrowLimit,
          join_date: m.joinDate,
          status: m.status,
        }));
        return {
          columns: ['member_id', 'name', 'email', 'phone', 'type', 'max_limit', 'join_date', 'status'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // 6. SELECT * FROM borrow_transactions
      if (/select.*from\s+(borrow_transactions|transactions)/i.test(cleanSql)) {
        const rows = this.transactions.map((t) => ({
          transaction_id: t.id,
          book_id: t.bookId,
          member_id: t.memberId,
          issue_date: t.issueDate,
          due_date: t.dueDate,
          return_date: t.returnDate || 'NULL (Active)',
          fine_amount: `$${t.fineAmount.toFixed(2)}`,
          status: t.status,
        }));
        return {
          columns: ['transaction_id', 'book_id', 'member_id', 'issue_date', 'due_date', 'return_date', 'fine_amount', 'status'],
          rows,
          queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
          rowCount: rows.length,
          rawSql: cleanSql,
        };
      }

      // Default fallback
      return {
        columns: ['status', 'message'],
        rows: [
          {
            status: 'NOTICE',
            message: `Executed query successfully. To test specific JOIN reports, choose from the quick query presets or inspect the books, members, or transactions tables.`,
          },
        ],
        queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
        rowCount: 1,
        rawSql: cleanSql,
      };
    } catch (err: any) {
      return {
        columns: ['error'],
        rows: [],
        queryTimeMs: Number((performance.now() - startTime).toFixed(2)),
        rowCount: 0,
        rawSql: cleanSql,
        error: err?.message || 'SQL Syntax or execution error',
      };
    }
  }

  // --- MYSQL SCHEMA GENERATOR (DDL & EXPORT) ---

  public generateSqlDdl(): string {
    return `-- ==========================================================
-- Normalized MySQL Schema for Library Management System
-- Engine: InnoDB (with Foreign Keys & Referential Integrity)
-- ==========================================================

DROP DATABASE IF EXISTS library_management_system;
CREATE DATABASE library_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management_system;

-- Table 1: Books Catalog (Inventory & Copies)
CREATE TABLE books (
    book_id VARCHAR(10) PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    total_copies INT UNSIGNED NOT NULL DEFAULT 1,
    available_copies INT UNSIGNED NOT NULL DEFAULT 1,
    shelf_location VARCHAR(20) NOT NULL,
    publication_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_author (author)
) ENGINE=InnoDB;

-- Table 2: Library Members (Students & Faculty)
CREATE TABLE members (
    member_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    member_type ENUM('Student', 'Faculty', 'Researcher') DEFAULT 'Student',
    max_borrow_limit INT UNSIGNED DEFAULT 3,
    join_date DATE NOT NULL,
    status ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 3: Borrow Transactions (Linked through Foreign Keys)
CREATE TABLE borrow_transactions (
    transaction_id VARCHAR(15) PRIMARY KEY,
    book_id VARCHAR(10) NOT NULL,
    member_id VARCHAR(10) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    fine_amount DECIMAL(6, 2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,
    status ENUM('ISSUED', 'RETURNED', 'OVERDUE') DEFAULT 'ISSUED',
    notes TEXT NULL,
    CONSTRAINT fk_book_id FOREIGN KEY (book_id)
        REFERENCES books(book_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_member_id FOREIGN KEY (member_id)
        REFERENCES members(member_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- Seed Data insertion
INSERT INTO books (book_id, isbn, title, author, category, total_copies, available_copies, shelf_location, publication_year) VALUES
${this.books
  .map(
    (b) =>
      `('${b.id}', '${b.isbn}', '${b.title.replace(/'/g, "''")}', '${b.author.replace(/'/g, "''")}', '${b.category}', ${b.totalCopies}, ${b.availableCopies}, '${b.shelfLocation}', ${b.publicationYear})`
  )
  .join(',\n')};

INSERT INTO members (member_id, name, email, phone, member_type, max_borrow_limit, join_date, status) VALUES
${this.members
  .map(
    (m) =>
      `('${m.id}', '${m.name.replace(/'/g, "''")}', '${m.email}', '${m.phone}', '${m.type}', ${m.maxBorrowLimit}, '${m.joinDate}', '${m.status}')`
  )
  .join(',\n')};

INSERT INTO borrow_transactions (transaction_id, book_id, member_id, issue_date, due_date, return_date, fine_amount, fine_paid, status) VALUES
${this.transactions
  .map(
    (t) =>
      `('${t.id}', '${t.bookId}', '${t.memberId}', '${t.issueDate}', '${t.dueDate}', ${t.returnDate ? `'${t.returnDate}'` : 'NULL'}, ${t.fineAmount}, ${t.finePaid ? 'TRUE' : 'FALSE'}, '${t.status}')`
  )
  .join(',\n')};
`;
  }
}

export const db = new LibraryDatabaseService();
