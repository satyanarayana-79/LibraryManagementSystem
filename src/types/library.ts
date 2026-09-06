export type BookCategory = 
  | 'Computer Science'
  | 'Fiction'
  | 'Mathematics'
  | 'Physics'
  | 'Philosophy'
  | 'History'
  | 'Biography';

export interface Book {
  id: string; // e.g. "B001"
  isbn: string;
  title: string;
  author: string;
  category: BookCategory;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  publicationYear: number;
  coverColor?: string;
}

export type MemberType = 'Student' | 'Faculty' | 'Researcher';

export interface Member {
  id: string; // e.g. "M001"
  name: string;
  email: string;
  phone: string;
  type: MemberType;
  maxBorrowLimit: number;
  joinDate: string; // YYYY-MM-DD
  status: 'Active' | 'Suspended' | 'Inactive';
}

export type TransactionStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE';

export interface BorrowTransaction {
  id: string; // e.g. "T1001"
  bookId: string;
  memberId: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD or null if still out
  fineAmount: number; // calculated fine in $
  finePaid: boolean;
  status: TransactionStatus;
  notes?: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  queryTimeMs: number;
  rowCount: number;
  rawSql: string;
  error?: string;
}

export interface SystemStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  totalMembers: number;
  activeMembers: number;
  activeBorrowings: number;
  overdueCount: number;
  totalFinesCollected: number;
  pendingFines: number;
}
