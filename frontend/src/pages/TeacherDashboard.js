import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import MarkingDetailSheet from '../components/MarkingDetailSheet';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const [filters, setFilters] = useState({
    grade: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [filters, submissions]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/teacher/paper2/submissions`);
      setSubmissions(response.data);
      setFilteredSubmissions(response.data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    if (filters.grade) {
      filtered = filtered.filter(s => s.student_grade === parseInt(filters.grade));
    }

    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.student_name.toLowerCase().includes(search) ||
        s.exam_title.toLowerCase().includes(search)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const openMarkingDetail = async (submission) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/teacher/paper2/submissions/${submission.id}`
      );
      setSelectedSubmission(response.data);
      setShowDetail(true);
    } catch (err) {
      console.error('Failed to load submission detail:', err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      draft: 'bg-blue-50 text-blue-800 border-blue-200',
      scored: 'bg-green-50 text-green-800 border-green-200',
    };

    const labels = {
      submitted: t('status') + ': Submitted',
      draft: t('status') + ': Draft',
      scored: t('status') + ': Scored',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status] || styles.submitted}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title">📝 {t('dashboard')} - Teacher</h1>
              <p className="header-subtitle">{t('welcome')}, {user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button className="btn btn-secondary" onClick={logout}>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`${t('student_name')}...`}
                    className="input pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    data-testid="search-submissions"
                  />
                </div>
              </div>
              
              <select
                className="input"
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                data-testid="filter-grade"
              >
                <option value="">{t('all_grades')}</option>
                <option value="2">{t('grade')} 2</option>
                <option value="3">{t('grade')} 3</option>
                <option value="4">{t('grade')} 4</option>
                <option value="5">{t('grade')} 5</option>
              </select>
              
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                data-testid="filter-status"
              >
                <option value="">{t('all_statuses')}</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
                <option value="scored">Scored</option>
              </select>
            </div>
          </motion.div>

          {/* Submissions Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('submissions')}</h2>
              <span className="text-sm text-muted-foreground">
                {filteredSubmissions.length} {t('submissions').toLowerCase()}
              </span>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('no_submission')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {t('student_name')}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {t('grade')}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Exam
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {t('submitted_at')}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {t('status')}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                        data-testid="submission-row"
                      >
                        <td className="p-3">
                          <div className="font-medium">{submission.student_name}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{submission.student_grade}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">
                            {submission.exam_title}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="p-3">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openMarkingDetail(submission)}
                            data-testid="open-marking-detail-button"
                          >
                            {t('mark')}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Marking Detail Sheet */}
      {showDetail && selectedSubmission && (
        <MarkingDetailSheet
          submission={selectedSubmission}
          open={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedSubmission(null);
            loadSubmissions();
          }}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;