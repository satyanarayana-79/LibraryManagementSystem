import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Barcode,
  Calendar,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import { Book, BookCategory } from '../types/library';

interface BooksCatalogProps {
  books: Book[];
  onAddBook: (bookData: Omit<Book, 'id' | 'availableCopies'>) => { success: boolean; error?: string };
  onUpdateBook: (id: string, updates: Partial<Book>) => { success: boolean; error?: string };
  onDeleteBook: (id: string) => { success: boolean; error?: string };
  onIssueBookDirect: (book: Book) => void;
}

const CATEGORIES: BookCategory[] = [
  'Computer Science',
  'Fiction',
  'Mathematics',
  'Physics',
  'Philosophy',
  'History',
  'Biography',
];

export const BooksCatalog: React.FC<BooksCatalogProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onIssueBookDirect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science' as BookCategory,
    totalCopies: 5,
    shelfLocation: 'CS-A1-01',
    publicationYear: 2024,
  });

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm) ||
      book.shelfLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || book.category === selectedCategory;

    const matchesAvailability =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'AVAILABLE' && book.availableCopies > 0) ||
      (availabilityFilter === 'OUT_OF_STOCK' && book.availableCopies === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleOpenAdd = () => {
    setFeedbackError(null);
    setFormData({
      title: '',
      author: '',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Computer Science',
      totalCopies: 4,
      shelfLocation: 'CS-NEW-01',
      publicationYear: new Date().getFullYear(),
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      setFeedbackError('Title, author, and ISBN are required.');
      return;
    }

    const res = onAddBook({
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim(),
      category: formData.category,
      totalCopies: Number(formData.totalCopies),
      shelfLocation: formData.shelfLocation.trim(),
      publicationYear: Number(formData.publicationYear),
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setFeedbackError(res.error || 'Failed to add book.');
    }
  };

  const handleOpenEdit = (book: Book) => {
    setFeedbackError(null);
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation,
      publicationYear: book.publicationYear,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setFeedbackError(null);

    const res = onUpdateBook(editingBook.id, {
      title: formData.title.trim(),
      author: formData.author.trim(),
      isbn: formData.isbn.trim(),
      category: formData.category,
      totalCopies: Number(formData.totalCopies),
      shelfLocation: formData.shelfLocation.trim(),
      publicationYear: Number(formData.publicationYear),
    });

    if (res.success) {
      setEditingBook(null);
    } else {
      setFeedbackError(res.error || 'Failed to update book.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete '${title}'? The system will verify foreign key constraints.`)) {
      const res = onDeleteBook(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Author, ISBN, or Shelf..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter dropdowns & Add Book */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-lg text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-lg text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock</option>
              <option value="AVAILABLE">In Stock Only</option>
              <option value="OUT_OF_STOCK">Unavailable Only</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Books Inventory Directory ({filteredBooks.length} titles)
            </h2>
            <p className="text-xs text-slate-400">
              Normalized `books` table records with copy count tracking and shelf location indexing
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Records: {books.length}</span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Book ID & Title</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">ISBN</th>
                <th className="px-6 py-3">Shelf Location</th>
                <th className="px-6 py-3">Copies (Avail / Total)</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No books found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  const percentAvailable = Math.round(
                    (book.availableCopies / book.totalCopies) * 100
                  );

                  return (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {book.id}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer">
                              {book.title}
                            </p>
                            <p className="text-slate-400 text-xs">
                              Published: {book.publicationYear}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {book.author}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {book.category}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                        {book.isbn}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-600 text-xs">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {book.shelfLocation}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span
                              className={`font-semibold ${
                                isAvailable ? 'text-emerald-700' : 'text-rose-600'
                              }`}
                            >
                              {book.availableCopies} of {book.totalCopies}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">{percentAvailable}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${percentAvailable}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAvailable ? (
                            <button
                              onClick={() => onIssueBookDirect(book)}
                              title="Issue book to member"
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>Issue</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic px-2 py-1">
                              All on loan
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEdit(book)}
                            title="Edit book details"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                            title="Delete book"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {(isAddModalOpen || editingBook) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>{editingBook ? `Edit Book (${editingBook.id})` : 'Add New Book to Catalog'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBook(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {feedbackError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {feedbackError}
              </div>
            )}

            <form onSubmit={editingBook ? handleSaveEdit : handleSaveNew} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Clean Code"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author(s) *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Robert C. Martin"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as BookCategory })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0132350884"
                    className="w-full text-xs px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    placeholder="CS-A1-04"
                    className="w-full text-xs px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2030"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {editingBook ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
