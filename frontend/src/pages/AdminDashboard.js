import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { Users, UserPlus, LogOut, Search, Check, X } from 'lucide-react';
import AcademicLogo from '../components/AcademicLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    grade: 'grade_5'
  });

  useEffect(() => {
    // In real implementation, there would be an admin endpoint to list all users
    // For now, we'll show a placeholder
    setLoading(false);
    setUsers([]);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/register`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User created successfully!');
      setShowCreateUser(false);
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'student',
        grade: 'grade_5'
      });
      // Reload users
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-[#F59E0B]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <Users className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('dashboard.admin')}</h1>
                <p className="text-sm md:text-base text-[#6B7280]">{t('dashboard.welcome')}, <span className="font-semibold text-[#F59E0B]">{user.full_name}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => setShowCreateUser(true)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                data-testid="create-user-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:inline">{t('admin.addUser')}</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:pl-48 xl:pl-60 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#1F2937] mb-1" style={{fontFamily: 'Manrope, sans-serif'}}>{users.length}</div>
            <div className="text-sm font-medium text-[#6B7280]">Total Users</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#3B82F6] mb-1" style={{fontFamily: 'Manrope, sans-serif'}}>
              {users.filter(u => u.role === 'student').length}
            </div>
            <div className="text-sm font-medium text-[#6B7280]">Students</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#10B981] mb-1" style={{fontFamily: 'Manrope, sans-serif'}}>
              {users.filter(u => u.role === 'teacher').length}
            </div>
            <div className="text-sm font-medium text-[#6B7280]">{t('admin.teachers')}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#E5E7EB]">
            <div className="text-3xl font-bold text-[#F59E0B] mb-1" style={{fontFamily: 'Manrope, sans-serif'}}>
              {users.filter(u => u.role === 'parent').length}
            </div>
            <div className="text-sm font-medium text-[#6B7280]">{t('admin.parents')}</div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-[#E5E7EB]">
          <h2 className="text-2xl font-bold mb-6 text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
            {t('admin.userManagement')}
          </h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + " users..."}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                data-testid="user-search-input"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
              data-testid="user-role-filter"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="parent">Parents</option>
              <option value="admin">Admins</option>
              <option value="typesetter">Typesetters</option>
            </select>
          </div>

          {/* Users List */}
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 mb-2">No Users Yet</p>
              <p className="text-gray-500 text-sm">
                User management interface for listing, creating, and managing users.
              </p>
              <button
                onClick={() => setShowCreateUser(true)}
                className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                {t('admin.addUser')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{u.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.grade?.replace('_', ' ') || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {u.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {t('admin.active')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {t('admin.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-semibold">
                          {t('common.edit')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUser(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b-2 border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>
                {t('admin.addUser')}
              </h3>
              <button
                onClick={() => setShowCreateUser(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                  data-testid="new-user-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                  data-testid="new-user-email-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                  data-testid="new-user-password-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    data-testid="new-user-role-select"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                    <option value="typesetter">Typesetter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">Grade</label>
                  <select
                    value={newUser.grade}
                    onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B]"
                    data-testid="new-user-grade-select"
                  >
                    <option value="grade_2">Grade 2</option>
                    <option value="grade_3">Grade 3</option>
                    <option value="grade_4">Grade 4</option>
                    <option value="grade_5">Grade 5</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  data-testid="submit-create-user-btn"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;