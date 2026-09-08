# Library Management System (BiblioSQL)

A robust, enterprise-grade **Library Management System** engineered with **Python Object-Oriented Programming (OOP)** principles and a **3rd Normal Form (3NF) MySQL relational schema**. The system features real-time inventory management, issue/return circulation workflows, automated fine calculations, SQL injection defense demonstrations, and aggregate reporting analytics.

---

## 🚀 Key Features

### 1. Object-Oriented Architecture (OOP)
- **Encapsulation**: Strict private member variables with protected getters, setters, and business invariant checks.
- **Inheritance & Polymorphism**:
  - `Member` base class extended by `StudentMember` (14-day loan duration, 3-book maximum limit) and `FacultyMember` (30-day loan duration, 10-book limit).
- **Domain Entities**: Explicit models for `Book`, `Member`, `Transaction`, and `LibrarySystem` orchestration.

### 2. Normalized Relational Database (3NF)
- Fully normalized **MySQL schema (3NF)** with primary keys, foreign key constraints (`ON DELETE RESTRICT`), and indexed lookups.
- Core tables:
  - `books` (ISBN, title, author, category, shelf location, total/available copies)
  - `members` (Member ID, name, email, member type, max borrow quota, join date)
  - `borrow_transactions` (Transaction ID, book foreign key, member foreign key, issue date, due date, return date, fine amount, fine paid status)

### 3. Circulation & Desk Workflows
- **Issue Desk**: Validates book copy availability and member quota before checkout.
- **Return Desk**: Computes overdue duration and calculates late fees dynamically ($0.50/day).
- **Fine Management**: Tracks fine status (`Unpaid` / `Paid`) with single-click settlement.

### 4. Database Security & SQL Injection Defense
- Interactive comparison demonstrating the dangers of dynamic SQL string concatenation vs. safe parameterized queries (`cursor.execute(sql, (param,))`).

### 5. Analytics & SQL Reports
- Built-in SQL reports utilizing `GROUP BY`, `JOIN`, and aggregate operations (`COUNT`, `SUM`, `AVG`):
  - Most borrowed books and popular categories
  - Overdue loan audits with outstanding fine balances
  - Monthly circulation trends

### 6. Interactive Python CLI Console
- Built-in terminal simulation allowing administrators to run command-line actions like issuing books, listing inventory, querying member status, and executing safe SQL statements.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend / Tooling**: Node.js, Express, Vite
- **Concepts Demonstrated**: Python OOP (Inheritance, Polymorphism, Encapsulation), MySQL Relational Modeling (3NF, Foreign Keys, Indexes, Parameterized Queries)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/library-management-system.git
   cd library-management-system
