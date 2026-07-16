import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { 
  Search, 
  Upload, 
  User, 
  MapPin, 
  Sparkles, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  SlidersHorizontal,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  Plus,
  FileText,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  // Search and Filter state
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gender, setGender] = useState('');
  const [healthCondition, setHealthCondition] = useState('');

  // Pagination and listings state
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Inspector/Detail panel state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Add Patient Modal Form state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientCity, setPatientCity] = useState('');
  const [patientState, setPatientState] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientOccupation, setPatientOccupation] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [patientGoal, setPatientGoal] = useState('');
  const [patientSubmitting, setPatientSubmitting] = useState(false);
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');

  // Add Report Modal Form state
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportHemoglobin, setReportHemoglobin] = useState('');
  const [reportVitaminD, setReportVitaminD] = useState('');
  const [reportCholesterol, setReportCholesterol] = useState('');
  const [reportFastingGlucose, setReportFastingGlucose] = useState('');
  const [reportCreatinine, setReportCreatinine] = useState('');
  const [reportUrineProtein, setReportUrineProtein] = useState('Negative');
  const [reportBmi, setReportBmi] = useState('');
  const [reportDoctorNotes, setReportDoctorNotes] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  // Fetch users on filter change or page swap
  const fetchUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const params = {
        page,
        limit: 8,
        ...(search && { search }),
        ...(city && { city }),
        ...(state && { state }),
        ...(gender && { gender }),
        ...(healthCondition && { health_condition: healthCondition })
      };

      const response = await api.get('/admin/users', { params });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Failed to query users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(1);
    }, 400); // Debounce search calls to avoid DB overload
    return () => clearTimeout(delayDebounce);
  }, [search, city, state, gender, healthCondition]);

  // Handle viewing specific user report details
  const inspectUser = async (userRecord) => {
    setSelectedUser(userRecord);
    setUserReports([]);
    try {
      setLoadingReports(true);
      const response = await api.get(`/admin/users/${userRecord.client_id}`);
      if (response.data.success) {
        setUserReports(response.data.data.reports);
      }
    } catch (error) {
      console.error('Error fetching clinical reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle CSV file selection and upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUploadResult(null);
      setUploadError('');
    }
  };

  const uploadCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await api.post('/admin/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadResult(response.data);
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (selectedUser) {
          inspectUser(selectedUser);
        }
      }
    } catch (error) {
      console.error('CSV upload failure:', error);
      const msg = error.response?.data?.message || 'Error processing CSV upload.';
      setUploadError(msg);
      if (error.response?.data?.errors) {
        setUploadResult({ errors: error.response.data.errors });
      }
    } finally {
      setUploading(false);
    }
  };

  // Create Patient manual form handler
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientSuccess('');

    // Input checks
    if (!patientName || !patientEmail || !patientMobile || !patientCity || !patientState || !patientAge) {
      setPatientError('Please input all required parameters.');
      return;
    }

    setPatientSubmitting(true);
    try {
      const payload = {
        full_name: patientName,
        email: patientEmail,
        password: 'password', // Default temporary login password
        mobile: parseInt(patientMobile),
        city: patientCity,
        state: patientState,
        age: parseInt(patientAge),
        gender: patientGender,
        occupation: patientOccupation || 'Not Specified',
        health_condition: patientCondition || 'Normal',
        beauty_goal: patientGoal || 'None'
      };

      const response = await api.post('/auth/register', payload);
      if (response.data.success) {
        setPatientSuccess(`Patient profile created successfully with Client ID: #${response.data.user.client_id}`);
        // Reset states
        setPatientName('');
        setPatientEmail('');
        setPatientMobile('');
        setPatientCity('');
        setPatientState('');
        setPatientAge('');
        setPatientGender('Male');
        setPatientOccupation('');
        setPatientCondition('');
        setPatientGoal('');
        // Refresh users
        fetchUsers(1);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setPatientError(error.response?.data?.message || 'Failed to register client profile.');
    } finally {
      setPatientSubmitting(false);
    }
  };

  // Create individual report form handler
  const handleAddReport = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');

    if (!selectedUser) return;

    if (!reportHemoglobin || !reportVitaminD || !reportCholesterol || !reportFastingGlucose || !reportCreatinine || !reportBmi) {
      setReportError('Please input all diagnostic markers.');
      return;
    }

    setReportSubmitting(true);
    try {
      const payload = {
        client_id: selectedUser.client_id,
        report_date: reportDate ? new Date(reportDate) : new Date(),
        hemoglobin: parseFloat(reportHemoglobin),
        vitamin_d: parseFloat(reportVitaminD),
        cholesterol: parseFloat(reportCholesterol),
        blood_sugar_fasting: parseFloat(reportFastingGlucose),
        creatinine: parseFloat(reportCreatinine),
        urine_protein: reportUrineProtein,
        bmi: parseFloat(reportBmi),
        doctor_notes: reportDoctorNotes
      };

      const response = await api.post('/admin/reports', payload);
      if (response.data.success) {
        setReportSuccess('Diagnostic report registered successfully.');
        // Reset
        setReportHemoglobin('');
        setReportVitaminD('');
        setReportCholesterol('');
        setReportFastingGlucose('');
        setReportCreatinine('');
        setReportUrineProtein('Negative');
        setReportBmi('');
        setReportDoctorNotes('');
        // Refresh audit report history
        inspectUser(selectedUser);
      }
    } catch (error) {
      console.error('Diagnostic logging failed:', error);
      setReportError(error.response?.data?.message || 'Failed to log diagnostic metrics.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 pb-16 relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Portal Greeting */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Administrative Control Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage diagnostic data pipelines, run client searches, and audit reports.</p>
          </div>
          <button
            onClick={() => {
              setPatientError('');
              setPatientSuccess('');
              setShowAddPatientModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center space-x-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add New Patient</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Search, Filters, and Table (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CSV Uploader Panel */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center space-x-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
                <span>Diagnostic CSV Data Ingestion Pipe</span>
              </h3>

              <form onSubmit={uploadCSV} className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                    id="csv-file-upload"
                  />
                  <label
                    htmlFor="csv-file-upload"
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-[#111827]/60 hover:bg-[#1f2937]/60 border border-gray-700 hover:border-gray-500 rounded-xl cursor-pointer transition-colors text-sm text-gray-300"
                  >
                    <Upload className="h-4 w-4 text-emerald-400" />
                    <span>{csvFile ? csvFile.name : 'Select clinical reports CSV file'}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!csvFile || uploading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Ingest Records</span>
                    </>
                  )}
                </button>
              </form>

              {/* Upload Result Feedback */}
              {uploadResult && uploadResult.summary && (
                <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">CSV Batch Process Complete</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-2 text-gray-300">
                    <div>Total Lines: <strong className="text-white">{uploadResult.summary.totalRows}</strong></div>
                    <div>Upserted: <strong className="text-white">{uploadResult.summary.upsertedCount}</strong></div>
                    <div>Modified: <strong className="text-white">{uploadResult.summary.modifiedCount}</strong></div>
                    <div>Failures: <strong className="text-red-400">{uploadResult.summary.failedRowsCount}</strong></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start space-x-2">
                  <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Individual Row Failures details */}
              {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4 max-h-36 overflow-y-auto border border-red-500/15 rounded-xl bg-red-500/5 p-3 text-xs space-y-1">
                  <div className="font-bold text-red-400 mb-2 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Row Validation Failures:</span>
                  </div>
                  {uploadResult.errors.map((err, i) => (
                    <div key={i} className="text-gray-400">
                      Row <span className="font-mono text-gray-300">{err.row}</span>: {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters Section */}
            <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Client Search Index & Filters</span>
                </h3>
                { (search || city || state || gender || healthCondition) && (
                  <button
                    onClick={() => { setSearch(''); setCity(''); setState(''); setGender(''); setHealthCondition(''); }}
                    className="text-xs text-gray-500 hover:text-emerald-400 transition-colors font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Term */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full bg-[#1e293b]/30 border border-gray-700 pl-10 pr-4 py-2.5 text-sm text-white rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                {/* City */}
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Filter by City"
                  className="w-full bg-[#1e293b]/30 border border-gray-700 px-4 py-2.5 text-sm text-white rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />

                {/* State */}
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Filter by State"
                  className="w-full bg-[#1e293b]/30 border border-gray-700 px-4 py-2.5 text-sm text-white rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />

                {/* Gender */}
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#1e293b]/30 border border-gray-700 px-3 py-2.5 text-sm text-gray-300 rounded-xl focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>

                {/* Health Condition */}
                <input
                  type="text"
                  value={healthCondition}
                  onChange={(e) => setHealthCondition(e.target.value)}
                  placeholder="Filter by Health Condition"
                  className="w-full bg-[#1e293b]/30 border border-gray-700 px-4 py-2.5 text-sm text-white rounded-xl col-span-1 md:col-span-2 focus:border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl relative">
              {loadingUsers && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center z-15">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/40 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 border-b border-white/5">
                      <th className="py-4 px-6">Client Info</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4">Occupation</th>
                      <th className="py-4 px-4">Condition</th>
                      <th className="py-4 px-6 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-gray-500 font-semibold">
                          No registered clients found matching the search criteria.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr 
                          key={u.client_id}
                          onClick={() => inspectUser(u)}
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedUser?.client_id === u.client_id ? 'bg-emerald-500/5' : ''}`}
                        >
                          <td className="py-4 px-6">
                            <div className="font-semibold text-white">{u.full_name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">#{u.client_id} • {u.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-300">{u.city}</div>
                            <div className="text-xs text-gray-500">{u.state}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{u.occupation || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md border border-gray-700/50 inline-block max-w-[150px] truncate">
                              {u.health_condition || 'Normal'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                inspectUser(u);
                              }}
                              className="px-3 py-1.5 bg-[#1f2937]/50 hover:bg-[#374151]/50 border border-gray-700 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold transition-all"
                            >
                              Audit Reports
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="py-4 px-6 bg-slate-900/60 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} clients
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchUsers(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    <span className="text-sm font-semibold text-gray-300 px-3 py-1 bg-gray-800/40 rounded-lg border border-white/5">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchUsers(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-1.5 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detail View Audit drawer (4 cols) */}
          <div className="lg:col-span-4">
            {selectedUser ? (
              <div className="bg-slate-900/50 border border-emerald-500/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
                
                {/* Background decorative badge */}
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 text-emerald-500/[0.02]">
                  <Activity className="h-56 w-56" />
                </div>

                {/* Audit Profile Header */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">{selectedUser.full_name}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Client ID: #{selectedUser.client_id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Close Audit
                  </button>
                </div>

                {/* Demographic details */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block font-semibold uppercase tracking-wider">Age / Gender</span>
                      <span className="text-gray-300 text-sm mt-0.5 inline-block">{selectedUser.age} yrs, {selectedUser.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block font-semibold uppercase tracking-wider">Mobile</span>
                      <span className="text-gray-300 text-sm mt-0.5 inline-block font-mono">{selectedUser.mobile}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 block font-semibold uppercase tracking-wider">Geography</span>
                    <span className="text-gray-300 text-sm mt-0.5 inline-block flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      <span>{selectedUser.city}, {selectedUser.state}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-emerald-500 font-bold block uppercase tracking-wider flex items-center space-x-1 mb-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Diagnosed Medical Status</span>
                    </span>
                    <p className="text-gray-300 text-sm bg-slate-950/40 p-2.5 rounded-lg border border-white/5">{selectedUser.health_condition || 'Normal/No Conditions'}</p>
                  </div>

                  <div>
                    <span className="text-teal-400 font-bold block uppercase tracking-wider flex items-center space-x-1 mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Aesthetic Goal</span>
                    </span>
                    <p className="text-gray-300 text-sm bg-slate-950/40 p-2.5 rounded-lg border border-white/5">{selectedUser.beauty_goal || 'None Specified'}</p>
                  </div>
                </div>

                {/* Audit Health History */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Calendar className="h-4.5 w-4.5 text-emerald-500" />
                      <span>Audit Diagnostic History</span>
                    </h4>
                    <button
                      onClick={() => {
                        setReportError('');
                        setReportSuccess('');
                        setShowAddReportModal(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Log Report</span>
                    </button>
                  </div>

                  {loadingReports ? (
                    <div className="flex flex-col items-center py-8 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-xs text-gray-500">Querying reports index...</p>
                    </div>
                  ) : userReports.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4 text-center">
                      No clinical health reports processed for this client.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {userReports.map((report) => (
                        <div 
                          key={report.report_id} 
                          className="bg-slate-950/40 border border-white/5 hover:border-emerald-500/20 rounded-xl p-3.5 transition-all text-xs"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-200">{formatDate(report.report_date)}</span>
                            <span className="font-mono text-[10px] text-gray-500">ID: {report.report_id}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-gray-400 font-mono mb-2">
                            <div>BMI: <span className="text-white">{report.bmi}</span></div>
                            <div>Fbs: <span className="text-white">{report.blood_sugar_fasting}</span></div>
                            <div>Chol: <span className="text-white">{report.cholesterol}</span></div>
                            <div>Hgb: <span className="text-white">{report.hemoglobin}</span></div>
                            <div>Vit D: <span className="text-white">{report.vitamin_d}</span></div>
                            <div>Cr: <span className="text-white">{report.creatinine}</span></div>
                          </div>

                          {report.doctor_notes && (
                            <div className="border-t border-white/5 pt-2 mt-2 text-gray-500 italic leading-relaxed">
                              Notes: {report.doctor_notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/20 border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 shadow-inner">
                <User className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <h4 className="font-bold text-gray-400">Client Audit Mode</h4>
                <p className="text-xs mt-1 max-w-[220px] mx-auto text-gray-600">
                  Select a user profile from the search results to inspect clinical biometrics and logs.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* MODAL 1: ADD PATIENT MODAL */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddPatientModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-emerald-400" />
              <span>Create Patient Profile</span>
            </h3>

            {patientError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{patientError}</span>
              </div>
            )}

            {patientSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{patientSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPatient} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Mobile *</label>
                  <input
                    type="number"
                    required
                    value={patientMobile}
                    onChange={(e) => setPatientMobile(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Age"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Gender *</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-950 border border-gray-800 px-2 py-2 text-gray-300 rounded-lg focus:border-emerald-500 outline-none text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={patientCity}
                    onChange={(e) => setPatientCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={patientState}
                    onChange={(e) => setPatientState(e.target.value)}
                    placeholder="State"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Occupation</label>
                <input
                  type="text"
                  value={patientOccupation}
                  onChange={(e) => setPatientOccupation(e.target.value)}
                  placeholder="Occupation"
                  className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Health Condition</label>
                <input
                  type="text"
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value)}
                  placeholder="e.g. Mild Hypertension"
                  className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Beauty Goal</label>
                <input
                  type="text"
                  value={patientGoal}
                  onChange={(e) => setPatientGoal(e.target.value)}
                  placeholder="e.g. Anti-aging"
                  className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 border border-gray-850 hover:bg-white/5 text-gray-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patientSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center"
                >
                  {patientSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD HEALTH REPORT MODAL */}
      {showAddReportModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddReportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span>Log Diagnostic Report</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">Adding diagnostics parameters under patient: <span className="text-white font-semibold">{selectedUser.full_name}</span></p>

            {reportError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{reportError}</span>
              </div>
            )}

            {reportSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{reportSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddReport} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Report Date *</label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Body Mass Index (BMI) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={reportBmi}
                    onChange={(e) => setReportBmi(e.target.value)}
                    placeholder="e.g. 22.4"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Glucose *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportFastingGlucose}
                    onChange={(e) => setReportFastingGlucose(e.target.value)}
                    placeholder="mg/dL"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Cholesterol *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportCholesterol}
                    onChange={(e) => setReportCholesterol(e.target.value)}
                    placeholder="mg/dL"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Hemoglobin *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportHemoglobin}
                    onChange={(e) => setReportHemoglobin(e.target.value)}
                    placeholder="g/dL"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Vitamin D *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reportVitaminD}
                    onChange={(e) => setReportVitaminD(e.target.value)}
                    placeholder="ng/mL"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Creatinine *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={reportCreatinine}
                    onChange={(e) => setReportCreatinine(e.target.value)}
                    placeholder="mg/dL"
                    className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Urine Protein *</label>
                  <select
                    value={reportUrineProtein}
                    onChange={(e) => setReportUrineProtein(e.target.value)}
                    className="w-full bg-slate-950 border border-gray-800 px-2 py-2 text-gray-300 rounded-lg focus:border-emerald-500 outline-none text-xs"
                  >
                    <option value="Negative">Negative / Nil</option>
                    <option value="Trace">Trace</option>
                    <option value="1+">1+</option>
                    <option value="2+">2+</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Doctor's Clinical Notes</label>
                <textarea
                  value={reportDoctorNotes}
                  onChange={(e) => setReportDoctorNotes(e.target.value)}
                  placeholder="Input health advice..."
                  rows="3"
                  className="w-full bg-slate-950 border border-gray-800 px-3 py-2 text-white rounded-lg focus:border-emerald-500 outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddReportModal(false)}
                  className="px-4 py-2 border border-gray-850 hover:bg-white/5 text-gray-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center"
                >
                  {reportSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Report'}
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
