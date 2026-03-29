import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../AuthContext';
import axios from 'axios';
import { Users, UserPlus, LogOut, Search, X, BookOpen, Layers, BarChart3, GraduationCap, Music, CheckCircle, Clock, AlertCircle, Download, Upload, DollarSign, FileSpreadsheet, CreditCard, Building2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [markerPayments, setMarkerPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const csvInputRef = useRef(null);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvResults, setCsvResults] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);

  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'student', grade: 'grade_5' });
  const [newBatch, setNewBatch] = useState({ name: '', grade: 'grade_5', description: '', language: 'si', teacher_incharge: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, batchesRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/batches`, { headers }),
        axios.get(`${API}/admin/statistics`, { headers })
      ]);
      setUsers(usersRes.data.users || []);
      setBatches(batchesRes.data.batches || []);
      setStats(statsRes.data);
    } catch (err) { console.error('Failed to load data:', err); }
    finally { setLoading(false); }
  };

  const loadMarkerPayments = async () => {
    try {
      const res = await axios.get(`${API}/admin/marker-payments`, { headers });
      setMarkerPayments(res.data);
    } catch (err) { console.error('Failed to load payments:', err); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, newUser, { headers });
      alert('User created!');
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'student', grade: 'grade_5' });
      loadData();
    } catch (error) { alert('Error: ' + (error.response?.data?.detail || error.message)); }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/batches/create`, newBatch, { headers });
      alert('Batch created!');
      setShowCreateBatch(false);
      setNewBatch({ name: '', grade: 'grade_5', description: '', language: 'si', teacher_incharge: '' });
      loadData();
    } catch (error) { alert('Error: ' + (error.response?.data?.detail || error.message)); }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvUploading(true);
    setCsvResults(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/admin/import-students-csv`, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setCsvResults(res.data);
      loadData();
    } catch (error) { alert('CSV Import Error: ' + (error.response?.data?.detail || error.message)); }
    finally { setCsvUploading(false); if (csvInputRef.current) csvInputRef.current.value = ''; }
  };

  const handlePayMarker = async (markerId, markerName) => {
    const ref = prompt(`Enter bank transfer reference for ${markerName}:`);
    if (!ref) return;
    try {
      await axios.post(`${API}/admin/pay-marker/${markerId}`, { reference_number: ref }, { headers });
      alert('Payments processed!');
      loadMarkerPayments();
    } catch (error) { alert('Error: ' + (error.response?.data?.detail || error.message)); }
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
    { id: 'payments', label: 'Payments', icon: CreditCard },
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
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#E5E7EB] overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'payments') loadMarkerPayments(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
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
            {/* ===== OVERVIEW TAB ===== */}
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
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4" style={{fontFamily: 'Manrope, sans-serif'}}>Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button onClick={() => { setActiveTab('users'); setShowCreateUser(true); }} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center" data-testid="quick-add-user">
                      <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" /><span className="text-sm font-semibold text-blue-700">Add User</span>
                    </button>
                    <button onClick={() => setShowCsvImport(true)} className="p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-center" data-testid="quick-csv-import">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-600 mx-auto mb-2" /><span className="text-sm font-semibold text-emerald-700">CSV Import</span>
                    </button>
                    <button onClick={() => { setActiveTab('batches'); setShowCreateBatch(true); }} className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-center" data-testid="quick-add-batch">
                      <Layers className="w-6 h-6 text-pink-600 mx-auto mb-2" /><span className="text-sm font-semibold text-pink-700">Create Batch</span>
                    </button>
                    <button onClick={() => { setActiveTab('payments'); loadMarkerPayments(); }} className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-center" data-testid="quick-payments">
                      <CreditCard className="w-6 h-6 text-amber-600 mx-auto mb-2" /><span className="text-sm font-semibold text-amber-700">Marker Payments</span>
                    </button>
                    <a href={`${API.replace('/api','')}/admin-dl/Grade5-Exam-Portable-v2.1.0.zip`} download className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center block" data-testid="download-desktop-app">
                      <Download className="w-6 h-6 text-green-600 mx-auto mb-2" /><span className="text-sm font-semibold text-green-700">Desktop App</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ===== USERS TAB ===== */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB]">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                  <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>{t('admin.userManagement')}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCsvImport(true)} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm" data-testid="csv-import-btn">
                      <FileSpreadsheet className="w-4 h-4" />CSV Import
                    </button>
                    <button onClick={() => setShowCreateUser(true)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm" data-testid="create-user-btn">
                      <UserPlus className="w-4 h-4" />Add User
                    </button>
                  </div>
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
                    <option value="student">Students</option><option value="teacher">Teachers</option>
                    <option value="parent">Parents</option><option value="marker">Markers</option><option value="admin">Admins</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500 mb-3">{filteredUsers.length} users found</div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">School</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50" data-testid={`user-row-${u.email}`}>
                          <td className="px-3 py-3 text-sm font-medium text-[#1F2937]">{u.full_name}</td>
                          <td className="px-3 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-3 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{u.role}</span></td>
                          <td className="px-3 py-3 text-sm text-gray-600">{u.school || '-'}</td>
                          <td className="px-3 py-3">
                            {u.is_active !== false ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{t('admin.active')}</span>
                              : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{t('admin.inactive')}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== BATCHES TAB ===== */}
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
                        {batch.teacher_incharge && <p className="text-xs text-gray-500 mb-2">Teacher: <span className="font-semibold">{batch.teacher_incharge}</span></p>}
                        {batch.description && <p className="text-sm text-gray-600">{batch.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== PAYMENTS TAB ===== */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>Marker / Teacher Payments</h2>
                {!markerPayments ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F59E0B] border-t-transparent"></div></div>
                ) : markerPayments.markers?.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-[#E5E7EB]">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">No Payments Yet</p>
                    <p className="text-sm text-gray-500">Payments will appear here after markers submit marks</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {markerPayments.markers.map(marker => (
                      <div key={marker.marker_id} className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]" data-testid={`marker-payment-${marker.marker_id}`}>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-[#1F2937] text-lg">{marker.marker_name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Papers marked: {marker.total_papers}</p>
                            {marker.bank_details ? (
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                                <Building2 className="w-3 h-3" />
                                {marker.bank_details.bank_name} - {marker.bank_details.branch} | A/C: {marker.bank_details.account_number} | {marker.bank_details.account_holder_name}
                              </div>
                            ) : (
                              <p className="text-xs text-amber-600 mt-2">Bank details not provided yet</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Pending: <span className="text-lg font-bold text-red-600">LKR {marker.total_pending}</span></div>
                            <div className="text-sm text-gray-500">Paid: <span className="font-bold text-green-600">LKR {marker.total_paid}</span></div>
                            {marker.total_pending > 0 && marker.bank_details && (
                              <button onClick={() => handlePayMarker(marker.marker_id, marker.marker_name)}
                                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700" data-testid={`pay-marker-${marker.marker_id}`}>
                                Pay LKR {marker.total_pending}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== TEACHING TAB ===== */}
            {activeTab === 'teaching' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
                  <div className="flex items-center gap-3 mb-4">
                    <Music className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-[#1F2937]" style={{fontFamily: 'Manrope, sans-serif'}}>MCQ Teaching Sessions</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Upload MP3 audio explanations for MCQ answers. Students pay separately to access these after completing exams.</p>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">How it works:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>1. Create a teaching session linked to an exam</li>
                      <li>2. Upload MP3 audio (60 questions x 2 min = ~2 hours)</li>
                      <li>3. Set a price (LKR) for student access</li>
                      <li>4. Available 7 days after exam | 4 per language/month</li>
                      <li>5. 3 languages x 4 = 12 recordings/month</li>
                    </ul>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-700">Full teaching session management coming soon</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== CREATE USER MODAL ===== */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateUser(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1F2937]">{t('admin.addUser')}</h3>
              <button onClick={() => setShowCreateUser(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Full Name *</label>
                <input type="text" required value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-name-input" /></div>
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Email *</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-email-input" /></div>
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Password *</label>
                <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg focus:ring-2 focus:ring-[#F59E0B] text-sm" data-testid="new-user-password-input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-[#374151] mb-1">Role *</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" data-testid="new-user-role-select">
                    <option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="marker">Marker</option><option value="admin">Admin</option>
                  </select></div>
                <div><label className="block text-sm font-semibold text-[#374151] mb-1">Grade</label>
                  <select value={newUser.grade} onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" data-testid="new-user-grade-select">
                    <option value="grade_2">Grade 2</option><option value="grade_3">Grade 3</option><option value="grade_4">Grade 4</option><option value="grade_5">Grade 5</option>
                  </select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm" data-testid="submit-create-user-btn">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CREATE BATCH MODAL ===== */}
      {showCreateBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateBatch(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1F2937]">Create Batch</h3>
              <button onClick={() => setShowCreateBatch(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-5 space-y-4">
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Batch / School Name *</label>
                <input type="text" required value={newBatch.name} onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" placeholder="e.g., Royal College Colombo" data-testid="batch-name-input" /></div>
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Teacher In-Charge</label>
                <input type="text" value={newBatch.teacher_incharge} onChange={(e) => setNewBatch({...newBatch, teacher_incharge: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" placeholder="e.g., Mrs. Silva" data-testid="batch-teacher-input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-[#374151] mb-1">Grade *</label>
                  <select value={newBatch.grade} onChange={(e) => setNewBatch({...newBatch, grade: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" data-testid="batch-grade-select">
                    <option value="grade_2">Grade 2</option><option value="grade_3">Grade 3</option><option value="grade_4">Grade 4</option><option value="grade_5">Grade 5</option>
                  </select></div>
                <div><label className="block text-sm font-semibold text-[#374151] mb-1">Language *</label>
                  <select value={newBatch.language} onChange={(e) => setNewBatch({...newBatch, language: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" data-testid="batch-language-select">
                    <option value="si">Sinhala</option><option value="ta">Tamil</option><option value="en">English</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-semibold text-[#374151] mb-1">Description</label>
                <textarea value={newBatch.description} onChange={(e) => setNewBatch({...newBatch, description: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-[#D1D5DB] rounded-lg text-sm" rows="2" placeholder="Optional..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateBatch(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 text-sm">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 text-sm" data-testid="submit-create-batch-btn">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CSV IMPORT MODAL ===== */}
      {showCsvImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowCsvImport(false); setCsvResults(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1F2937]">Bulk Student Import (CSV)</h3>
              <button onClick={() => { setShowCsvImport(false); setCsvResults(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">CSV Format (columns):</h4>
                <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded block">student_name, student_email, parent_name, parent_email, grade, language, school, teacher_incharge</code>
                <p className="text-xs text-blue-600 mt-2">
                  - <b>grade:</b> 2, 3, 4, or 5 | <b>language:</b> si, ta, or en<br/>
                  - School name auto-creates batches | Passwords auto-generated<br/>
                  - Parent accounts auto-linked to students
                </p>
              </div>

              <div className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-8 text-center">
                <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" id="csv-file" data-testid="csv-file-input" />
                {csvUploading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#F59E0B] border-t-transparent mx-auto"></div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label htmlFor="csv-file" className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer inline-block" data-testid="csv-upload-btn">
                      Choose CSV File
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Upload a .csv file with student data</p>
                  </>
                )}
              </div>

              {csvResults && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 rounded-lg p-3 text-center border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{csvResults.created}</div>
                      <div className="text-xs text-green-600">Created</div>
                    </div>
                    <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                      <div className="text-2xl font-bold text-amber-700">{csvResults.skipped}</div>
                      <div className="text-xs text-amber-600">Skipped</div>
                    </div>
                    <div className="flex-1 bg-red-50 rounded-lg p-3 text-center border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{csvResults.errors?.length || 0}</div>
                      <div className="text-xs text-red-600">Errors</div>
                    </div>
                  </div>

                  {csvResults.details?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 max-h-60 overflow-y-auto">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Created Accounts (save these credentials!):</h4>
                      <table className="w-full text-xs">
                        <thead><tr className="text-gray-500">
                          <th className="text-left pb-1">Student</th><th className="text-left pb-1">Email</th><th className="text-left pb-1">Password</th><th className="text-left pb-1">School</th>
                        </tr></thead>
                        <tbody>{csvResults.details.map((d, i) => (
                          <tr key={i} className="border-t border-gray-200">
                            <td className="py-1 font-medium">{d.student_name}</td>
                            <td className="py-1">{d.student_email}</td>
                            <td className="py-1 font-mono text-green-700">{d.student_password}</td>
                            <td className="py-1">{d.batch || '-'}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}

                  {csvResults.errors?.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-1 text-sm">Errors:</h4>
                      {csvResults.errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
