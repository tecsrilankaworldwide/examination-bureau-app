import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { Users, UserPlus, LogOut, Search, X, BookOpen, Layers, BarChart3, GraduationCap, Music, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Modals
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'student', grade: 'grade_5' });
  // New batch form
  const [newBatch, setNewBatch] = useState({ name: '', grade: 'grade_5', description: '', language: 'si' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, batchesRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/batches`, { headers }),
        axios.get(`${API}/admin/statistics`, { headers })
      ]);
      setUsers(usersRes.data.users || []);
      setBatches(batchesRes.data.batches || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, newUser, { headers: { Authorization: `Bearer ${token}` } });
      alert('User created successfully!');
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'student', grade: 'grade_5' });
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/batches/create`, newBatch, { headers: { Authorization: `Bearer ${token}` } });
      alert('Batch created successfully!');
      setShowCreateBatch(false);
      setNewBatch({ name: '', grade: 'grade_5', description: '', language: 'si' });
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: t('admin.userManagement'), icon: Users },
    { id: 'batches', label: 'Batches', icon: Layers },
    { id: 'teaching', label: 'Teaching', icon: Music },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] to-[#FFF4E6]">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-[#F59E0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}} data-testid="admin-dashboard-title">{t('dashboard.admin')}</h1>
                <p className="text-sm text-[#6B7280]">{t('dashboard.welcome')}, <span className="font-semibold text-[#F59E0B]">{user?.full_name}</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <button onClick={logout} className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-1" data-testid="logout-btn">
                <LogOut className="w-4 h-4" /><span className="hidden md:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#E5E7EB]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-[#F59E0B] text-white shadow-md' : 'text-[#6B7280] hover:bg-[#FFF7E5]'
              }`} data-testid={`tab-${tab.id}`}>
              <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F59E0B] border-t-transparent"></div></div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Students', value: stats.total_students, color: '#3B82F6', icon: Users },
                    { label: 'Parents', value: stats.total_parents, color: '#10B981', icon: Users },
                    { label: 'Markers', value: stats.total_markers, color: '#8B5CF6', icon: BookOpen },
                    { label: 'Exams', value: stats.total_exams, color: '#F59E0B', icon: BookOpen },
                    { label: 'Batches', value: stats.total_batches, color: '#EC4899', icon: Layers },
                    { label: 'Attempts', value: stats.total_attempts, color: '#06B6D4', icon: BarChart3 },
                    { label: 'Pending Marking', value: stats.pending_marking, color: '#EF4444', icon: Clock },
                    { label: 'Completed', value: stats.completed_exams, color: '#22C55E', icon: CheckCircle },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB]" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                          <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{stat.value}</div>
                          <div className="text-xs font-medium text-[#6B7280]">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4" style={{fontFamily: 'Manrope, sans-serif'}}>Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => { setActiveTab('users'); setShowCreateUser(true); }} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center" data-testid="quick-add-user">
                      <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" /><span className="text-sm font-semibold text-blue-700">Add User</span>
                    </button>
                    <button onClick={() => { setActiveTab('batches'); setShowCreateBatch(true); }} className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-center" data-testid="quick-add-batch">
                      <Layers className="w-6 h-6 text-pink-600 mx-auto mb-2" /><span className="text-sm font-semibold text-pink-700">Create Batch</span>
                    </button>
                    <button onClick={() => setActiveTab('teaching')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center" data-testid="quick-teaching">
                      <Music className="w-6 h-6 text-purple-600 mx-auto mb-2" /><span className="text-sm font-semibold text-purple-700">Teaching Sessions</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center">
                      <Users className="w-6 h-6 text-amber-600 mx-auto mb-2" /><span className="text-sm font-semibold text-amber-700">Manage Users</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('admin.userManagement')}</h2>
                  <button onClick={() => setShowCreateUser(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2" data-testid="create-user-btn">
                    <UserPlus className="w-4 h-4" />Add User
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="user-search-input" />
                  </div>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="user-role-filter">
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="parent">Parents</option>
                    <option value="marker">Markers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500 mb-3">{filteredUsers.length} users found</div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50" data-testid={`user-row-${u.email}`}>
                          <td className="px-3 py-3 text-sm font-medium text-[#1F2937]">{u.full_name}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-3 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{u.role}</span></td>
                          <td className="px-3 py-3 text-sm text-gray-600">{u.grade?.replace('_', ' ') || '-'}</td>
                          <td className="px-3 py-3">
                            {u.is_active !== false ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t('admin.active')}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t('admin.inactive')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Batches Tab */}
            {activeTab === 'batches' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>Batch / Class Management</h2>
                  <button onClick={() => setShowCreateBatch(true)} className="px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 flex items-center gap-2" data-testid="create-batch-btn">
                    <Layers className="w-4 h-4" />Create Batch
                  </button>
                </div>
                {batches.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#E5E7EB]">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600 mb-2">No Batches Created</p>
                    <p className="text-sm text-gray-500 mb-4">Create batches to organize students into classes</p>
                    <button onClick={() => setShowCreateBatch(true)} className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700">Create First Batch</button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {batches.map(batch => (
                      <div key={batch.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow" data-testid={`batch-card-${batch.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-[#1F2937]">{batch.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{batch.grade?.replace('_', ' ').toUpperCase()} | {batch.language === 'si' ? 'Sinhala' : batch.language === 'ta' ? 'Tamil' : 'English'}</p>
                          </div>
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">{batch.student_count} students</span>
                        </div>
                        {batch.description && <p className="text-sm text-gray-600 mb-3">{batch.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Teaching Tab */}
            {activeTab === 'teaching' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
                  <div className="flex items-center gap-3 mb-4">
                    <Music className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>MCQ Teaching Sessions</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload MP3 audio explanations for MCQ answers. Students pay separately to access these after completing exams.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">How it works:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>1. Create a teaching session linked to an exam</li>
                      <li>2. Upload the MP3 audio (60 questions x 2 min = ~2 hours per recording)</li>
                      <li>3. Set a price (LKR) for student access</li>
                      <li>4. Sessions become available to students 7 days after their exam</li>
                      <li>5. 4 recordings per language, 3 languages = 12 recordings/month</li>
                    </ul>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {['Sinhala (si)', 'Tamil (ta)', 'English (en)'].map((lang, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">{stats?.total_teaching_sessions || 0}</div>
                        <div className="text-xs text-gray-600">{lang} Sessions</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-700">Teaching session management UI will be expanded as recordings are uploaded</span>
                  </div>
                </div>

                {/* Pending Payment Verifications */}
                {stats?.pending_teaching_payments > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
                    <h3 className="font-bold text-[#1F2937] mb-3">Pending Payment Verifications ({stats.pending_teaching_payments})</h3>
                    <p className="text-sm text-gray-600">Review and verify student payments for teaching sessions.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUser(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('admin.addUser')}</h3>
              <button onClick={() => setShowCreateUser(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Full Name *</label>
                <input type="text" required value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-name-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Email *</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-email-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Password *</label>
                <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-password-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Role *</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-role-select">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="marker">Marker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Grade</label>
                  <select value={newUser.grade} onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-grade-select">
                    <option value="grade_2">Grade 2</option><option value="grade_3">Grade 3</option>
                    <option value="grade_4">Grade 4</option><option value="grade_5">Grade 5</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm" data-testid="submit-create-user-btn">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateBatch(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>Create Batch</h3>
              <button onClick={() => setShowCreateBatch(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Batch Name *</label>
                <input type="text" required value={newBatch.name} onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm"
                  placeholder="e.g., Grade 5 - Batch A (Colombo)" data-testid="batch-name-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Grade *</label>
                  <select value={newBatch.grade} onChange={(e) => setNewBatch({...newBatch, grade: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="batch-grade-select">
                    <option value="grade_2">Grade 2</option><option value="grade_3">Grade 3</option>
                    <option value="grade_4">Grade 4</option><option value="grade_5">Grade 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Language *</label>
                  <select value={newBatch.language} onChange={(e) => setNewBatch({...newBatch, language: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="batch-language-select">
                    <option value="si">Sinhala</option><option value="ta">Tamil</option><option value="en">English</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Description</label>
                <textarea value={newBatch.description} onChange={(e) => setNewBatch({...newBatch, description: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" rows="2" placeholder="Optional description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateBatch(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 text-sm" data-testid="submit-create-batch-btn">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
