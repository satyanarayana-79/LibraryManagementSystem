export const PYTHON_OOP_SOURCE_CODE = `"""
=============================================================================
LIBRARY MANAGEMENT SYSTEM - PYTHON OOP & MYSQL INTEGRATION
=============================================================================
Features:
- Object-Oriented Architecture (Book, Member, BorrowTransaction classes)
- Normalized MySQL relational schema with foreign key referential integrity
- Parameterized SQL queries preventing SQL Injection
- Automated overdue fine calculations ($0.50 / day)
- Analytical reports using SQL JOINs & aggregate functions
=============================================================================
"""

import datetime
from typing import List, Optional, Tuple
import mysql.connector
from mysql.connector import Error

# ---------------------------------------------------------------------------
# DOMAIN MODELS (OOP IMPLEMENTATION)
# ---------------------------------------------------------------------------

class Book:
    """Models a physical or digital catalog book."""
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
        """Check if at least one copy is in stock."""
        return self.available_copies > 0

    def borrow_copy(self) -> bool:
        """Decrement available copies when issued."""
        if self.is_available():
            self.available_copies -= 1
            return True
        return False

    def return_copy(self) -> bool:
        """Increment available copies when returned."""
        if self.available_copies < self.total_copies:
            self.available_copies += 1
            return True
        return False

    def __repr__(self) -> str:
        return f"<Book {self.id}: '{self.title}' by {self.author} ({self.available_copies}/{self.total_copies} available)>"


class Member:
    """Models a library member (Student, Faculty, Researcher)."""
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
        self.active_borrows: List['BorrowTransaction'] = []

    def can_borrow(self) -> Tuple[bool, str]:
        """Validate if member is eligible to borrow another book."""
        if self.status != "Active":
            return False, f"Member account is {self.status}."
        if len(self.active_borrows) >= self.max_borrow_limit:
            return False, f"Maximum borrow limit ({self.max_borrow_limit}) reached."
        return True, "Eligible"

    def __repr__(self) -> str:
        return f"<Member {self.id}: {self.name} [{self.member_type}] (Active: {len(self.active_borrows)}/{self.max_borrow_limit})>"


class BorrowTransaction:
    """Models a borrowing transaction lifecycle."""
    DAILY_FINE_RATE = 0.50  # $0.50 per overdue day

    def __init__(self, transaction_id: str, book_id: str, member_id: str,
                 issue_date: datetime.date, due_date: datetime.date,
                 return_date: Optional[datetime.date] = None,
                 fine_amount: float = 0.0, fine_paid: bool = False,
                 status: str = "ISSUED"):
        self.id = transaction_id
        self.book_id = book_id
        self.member_id = member_id
        self.issue_date = issue_date
        self.due_date = due_date
        self.return_date = return_date
        self.fine_amount = fine_amount
        self.fine_paid = fine_paid
        self.status = status

    def calculate_fine(self, current_date: Optional[datetime.date] = None) -> float:
        """Calculate fine based on overdue days beyond due_date."""
        target_date = self.return_date or current_date or datetime.date.today()
        if target_date > self.due_date:
            overdue_days = (target_date - self.due_date).days
            return round(overdue_days * self.DAILY_FINE_RATE, 2)
        return 0.0

    def complete_return(self, return_date: Optional[datetime.date] = None) -> float:
        """Mark the transaction as returned and calculate overdue fine."""
        self.return_date = return_date or datetime.date.today()
        self.fine_amount = self.calculate_fine(self.return_date)
        self.status = "RETURNED"
        return self.fine_amount


# ---------------------------------------------------------------------------
# DATABASE ACCESS LAYER (PARAMETERIZED MYSQL QUERIES)
# ---------------------------------------------------------------------------

class LibraryDatabase:
    """
    Handles secure, parameterized communication with MySQL server.
    Guarantees referential integrity through foreign keys and atomic transactions.
    """
    def __init__(self, host="localhost", user="root", password="", database="library_db"):
        self.config = {
            "host": host,
            "user": user,
            "password": password,
            "database": database,
            "raise_on_warnings": True
        }

    def get_connection(self):
        return mysql.connector.connect(**self.config)

    def initialize_schema(self):
        """Creates 3NF normalized tables with foreign keys."""
        ddl_statements = [
            """
            CREATE TABLE IF NOT EXISTS books (
                book_id VARCHAR(10) PRIMARY KEY,
                isbn VARCHAR(20) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                category VARCHAR(50) NOT NULL,
                total_copies INT UNSIGNED NOT NULL DEFAULT 1,
                available_copies INT UNSIGNED NOT NULL DEFAULT 1,
                shelf_location VARCHAR(20),
                publication_year INT,
                INDEX idx_category (category),
                INDEX idx_author (author)
            ) ENGINE=InnoDB;
            """,
            """
            CREATE TABLE IF NOT EXISTS members (
                member_id VARCHAR(10) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(30),
                member_type ENUM('Student', 'Faculty', 'Researcher') DEFAULT 'Student',
                max_borrow_limit INT UNSIGNED DEFAULT 3,
                join_date DATE NOT NULL,
                status ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active'
            ) ENGINE=InnoDB;
            """,
            """
            CREATE TABLE IF NOT EXISTS borrow_transactions (
                transaction_id VARCHAR(15) PRIMARY KEY,
                book_id VARCHAR(10) NOT NULL,
                member_id VARCHAR(10) NOT NULL,
                issue_date DATE NOT NULL,
                due_date DATE NOT NULL,
                return_date DATE NULL,
                fine_amount DECIMAL(6, 2) DEFAULT 0.00,
                fine_paid BOOLEAN DEFAULT FALSE,
                status ENUM('ISSUED', 'RETURNED', 'OVERDUE') DEFAULT 'ISSUED',
                CONSTRAINT fk_trx_book FOREIGN KEY (book_id)
                    REFERENCES books(book_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT,
                CONSTRAINT fk_trx_member FOREIGN KEY (member_id)
                    REFERENCES members(member_id)
                    ON UPDATE CASCADE ON DELETE RESTRICT,
                INDEX idx_trx_status (status),
                INDEX idx_trx_due (due_date)
            ) ENGINE=InnoDB;
            """
        ]
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for statement in ddl_statements:
                    cursor.execute(statement)
            conn.commit()

    # --- CORE WORKFLOWS: ISSUE & RETURN ---

    def issue_book(self, transaction_id: str, book_id: str, member_id: str, duration_days: int = 14) -> bool:
        """
        Atomic issue workflow:
        1. Validate member borrow limit and active status.
        2. Validate book copy availability.
        3. Insert borrow transaction record.
        4. Decrement available copies in inventory.
        """
        conn = self.get_connection()
        try:
            conn.start_transaction()
            cursor = conn.cursor(dictionary=True)

            # Check member status & active borrow count using parameterized query
            cursor.execute(
                "SELECT status, max_borrow_limit FROM members WHERE member_id = %s",
                (member_id,)
            )
            member = cursor.fetchone()
            if not member or member["status"] != "Active":
                raise ValueError("Member does not exist or account is inactive.")

            cursor.execute(
                "SELECT COUNT(*) as active_cnt FROM borrow_transactions WHERE member_id = %s AND status != 'RETURNED'",
                (member_id,)
            )
            active_count = cursor.fetchone()["active_cnt"]
            if active_count >= member["max_borrow_limit"]:
                raise ValueError(f"Borrow limit reached ({active_count}/{member['max_borrow_limit']}).")

            # Check book availability
            cursor.execute(
                "SELECT available_copies FROM books WHERE book_id = %s FOR UPDATE",
                (book_id,)
            )
            book = cursor.fetchone()
            if not book or book["available_copies"] <= 0:
                raise ValueError("Book is currently unavailable.")

            today = datetime.date.today()
            due = today + datetime.timedelta(days=duration_days)

            # Insert transaction record
            cursor.execute(
                """
                INSERT INTO borrow_transactions 
                (transaction_id, book_id, member_id, issue_date, due_date, status)
                VALUES (%s, %s, %s, %s, %s, 'ISSUED')
                """,
                (transaction_id, book_id, member_id, today, due)
            )

            # Update book inventory
            cursor.execute(
                "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = %s",
                (book_id,)
            )

            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def return_book(self, transaction_id: str) -> float:
        """
        Atomic return workflow:
        1. Fetch transaction details.
        2. Calculate overdue fines if returned past due_date.
        3. Mark transaction as RETURNED.
        4. Increment available copies in inventory.
        """
        conn = self.get_connection()
        try:
            conn.start_transaction()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT book_id, due_date, status FROM borrow_transactions WHERE transaction_id = %s FOR UPDATE",
                (transaction_id,)
            )
            trx = cursor.fetchone()
            if not trx or trx["status"] == "RETURNED":
                raise ValueError("Invalid or already completed transaction.")

            today = datetime.date.today()
            fine = 0.0
            if today > trx["due_date"]:
                days_overdue = (today - trx["due_date"]).days
                fine = round(days_overdue * BorrowTransaction.DAILY_FINE_RATE, 2)

            # Update transaction
            cursor.execute(
                """
                UPDATE borrow_transactions
                SET return_date = %s, fine_amount = %s, status = 'RETURNED'
                WHERE transaction_id = %s
                """,
                (today, fine, transaction_id)
            )

            # Restore inventory copy
            cursor.execute(
                "UPDATE books SET available_copies = available_copies + 1 WHERE book_id = %s",
                (trx["book_id"],)
            )

            conn.commit()
            return fine
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    # --- ANALYTICAL REPORTS USING JOINS AND AGGREGATE SQL ---

    def report_most_borrowed_books(self, limit: int = 5):
        """
        JOIN books and borrow_transactions to calculate borrow frequency.
        Uses COUNT() aggregate function and GROUP BY.
        """
        query = """
            SELECT 
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
            LIMIT %s;
        """
        with self.get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(query, (limit,))
                return cursor.fetchall()

    def report_overdue_members(self):
        """
        Multi-table JOIN between members, transactions, and books.
        Calculates overdue days using DATEDIFF() and computed outstanding fines.
        """
        query = """
            SELECT 
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
            ORDER BY days_overdue DESC;
        """
        with self.get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(query)
                return cursor.fetchall()

    def report_monthly_circulation(self):
        """
        Aggregate monthly issue counts and returned volumes.
        Uses DATE_FORMAT() and COUNT(CASE WHEN...) conditional aggregation.
        """
        query = """
            SELECT 
                DATE_FORMAT(issue_date, '%Y-%m') AS circulation_month,
                COUNT(*) AS total_issued,
                COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) AS total_returned,
                COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdue_unreturned,
                SUM(fine_amount) AS total_fines_accrued
            FROM borrow_transactions
            GROUP BY circulation_month
            ORDER BY circulation_month DESC;
        """
        with self.get_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute(query)
                return cursor.fetchall()
`;
