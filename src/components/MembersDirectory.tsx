import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Member, MemberType, BorrowTransaction, Book } from '../types/library';

interface MembersDirectoryProps {
  members: Member[];
  transactions: BorrowTransaction[];
  books: Book[];
  onAddMember: (memberData: Omit<Member, 'id' | 'joinDate'>) => { success: boolean; error?: string };
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({
  members,
  transactions,
  books,
  onAddMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MemberType>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Student' as MemberType,
    maxBorrowLimit: 3,
    status: 'Active' as const,
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || member.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMemberActiveBorrows = (memberId: string) => {
    return transactions.filter((t) => t.memberId === memberId && !t.returnDate);
  };

  const getMemberTotalBorrows = (memberId: string) => {
    return transactions.filter((t) => t.memberId === memberId);
  };

  const handleOpenAdd = () => {
    setModalError(null);
    setFormData({
      name: '',
      email: '',
      phone: '+1 (555) ',
      type: 'Student',
      maxBorrowLimit: 3,
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const handleTypeChange = (type: MemberType) => {
    setFormData({
      ...formData,
      type,
      maxBorrowLimit: type === 'Faculty' ? 6 : type === 'Researcher' ? 5 : 3,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setModalError('Name and email are required.');
      return;
    }

    const res = onAddMember({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      type: formData.type,
      maxBorrowLimit: Number(formData.maxBorrowLimit),
      status: formData.status,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setModalError(res.error || 'Failed to register member.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-lg text-xs font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Student">Students Only</option>
              <option value="Faculty">Faculty Only</option>
              <option value="Researcher">Researchers Only</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const activeBorrows = getMemberActiveBorrows(member.id);
          const hasOverdue = activeBorrows.some((t) => t.status === 'OVERDUE');
          const isAtLimit = activeBorrows.length >= member.maxBorrowLimit;

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {member.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      member.type === 'Faculty'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : member.type === 'Researcher'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {member.type}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Quota & Active Borrows Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Active Borrow Quota:</span>
                    <span
                      className={`font-semibold ${
                        isAtLimit ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {activeBorrows.length} / {member.maxBorrowLimit} books
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isAtLimit ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (activeBorrows.length / member.maxBorrowLimit) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {hasOverdue && (
                  <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-md flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>Has overdue items requiring fine payment</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Joined: {member.joinDate}
                </span>
                <button
                  onClick={() => setSelectedMember(member)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Details & History
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member History Modal / Detail Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedMember.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedMember.id} · {selectedMember.type} · Max {selectedMember.maxBorrowLimit} Books
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Active Loans ({getMemberActiveBorrows(selectedMember.id).length})
              </h4>
              {getMemberActiveBorrows(selectedMember.id).length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No books currently on loan.</p>
              ) : (
                <div className="space-y-2">
                  {getMemberActiveBorrows(selectedMember.id).map((trx) => {
                    const book = books.find((b) => b.id === trx.bookId);
                    return (
                      <div
                        key={trx.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                          trx.status === 'OVERDUE'
                            ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{book?.title || trx.bookId}</p>
                          <p className="text-slate-500 text-[11px]">
                            Due: {trx.dueDate} · Issued: {trx.issueDate}
                          </p>
                        </div>
                        {trx.status === 'OVERDUE' && (
                          <div className="text-right">
                            <span className="font-mono font-bold text-rose-700">
                              Overdue Fine: ${trx.fineAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                All Historical Circulations ({getMemberTotalBorrows(selectedMember.id).length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {getMemberTotalBorrows(selectedMember.id).map((trx) => {
                  const book = books.find((b) => b.id === trx.bookId);
                  return (
                    <div key={trx.id} className="pt-2 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-800">{book?.title}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({trx.id})</span>
                      </div>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          trx.status === 'RETURNED'
                            ? 'bg-slate-100 text-slate-600'
                            : trx.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Register New Member</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rachel Zane"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rachel.zane@university.edu"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Member Role</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as MemberType)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Student">Student (Limit: 3)</option>
                    <option value="Faculty">Faculty (Limit: 6)</option>
                    <option value="Researcher">Researcher (Limit: 5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Borrow Limit</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxBorrowLimit}
                  onChange={(e) => setFormData({ ...formData, maxBorrowLimit: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces referential integrity and prevents over-borrowing in the database.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
