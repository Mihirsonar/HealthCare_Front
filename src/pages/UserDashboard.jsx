import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  Activity, 
  Droplet, 
  Flame, 
  Smile, 
  Calendar, 
  User, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  FileText
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Parallel fetching of latest report and history
        const [latestRes, historyRes] = await Promise.all([
          api.get('/reports/latest').catch(() => null), // If latest fails/not found, handle gracefully
          api.get('/reports/history').catch(() => ({ data: { data: [] } }))
        ]);

        if (latestRes && latestRes.data.success) {
          setLatestReport(latestRes.data.data);
          setSelectedReport(latestRes.data.data);
        }
        if (historyRes && historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard readings:', err);
        setError('Could not retrieve health analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to color code and rate biometric markers
  const getMetricAnalysis = (metricName, val) => {
    if (val === undefined || val === null) return { status: 'Unknown', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };

    switch (metricName) {
      case 'hemoglobin':
        if (val < 12) return { status: 'Anemia Risk', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val > 17.5) return { status: 'Elevated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      case 'vitamin_d':
        if (val < 20) return { status: 'Deficient', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val < 30) return { status: 'Sub-Optimal', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      case 'cholesterol':
        if (val >= 240) return { status: 'High Risk', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val >= 200) return { status: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      case 'blood_sugar_fasting':
        if (val >= 126) return { status: 'Diabetic Range', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val >= 100) return { status: 'Pre-diabetic', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      case 'creatinine':
        if (val > 1.3) return { status: 'Kidney Strain', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val < 0.6) return { status: 'Low Range', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      case 'bmi':
        if (val >= 30) return { status: 'Obese', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        if (val >= 25) return { status: 'Overweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        if (val < 18.5) return { status: 'Underweight', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
        return { status: 'Normal Weight', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

      default:
        return { status: 'Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Greeting */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back, {user?.full_name}</h1>
            <p className="text-gray-400 text-sm mt-1">Here is a comprehensive breakdown of your metabolic biomarkers.</p>
          </div>
          <div className="bg-[#1e293b]/40 backdrop-blur border border-white/5 rounded-xl px-4 py-2 flex items-center space-x-2 text-sm text-gray-400 shrink-0 self-start md:self-auto">
            <Calendar className="h-4 w-4 text-emerald-500" />
            <span>Last Synced: {latestReport ? formatDate(latestReport.report_date) : 'No Records Loaded'}</span>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="text-gray-400 animate-pulse text-sm">Parsing diagnostic results...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center space-x-3 text-red-400 max-w-2xl mx-auto mt-12">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-bold text-white">API Diagnostic Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Columns: Metrics Cards & Report Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {!latestReport ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <HeartPulse className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">No Diagnostic Reports Logged</h3>
                  <p className="text-gray-400 max-w-md mx-auto mt-2 text-sm">
                    We haven't processed any clinical health reports for your client ID yet. Please reach out to your administrator to upload your latest bloodwork results.
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected/Latest Report Bio-markers Grid */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-emerald-500" />
                      <span>Biomarkers Details for {formatDate(selectedReport?.report_date)}</span>
                      {selectedReport?.report_id === latestReport?.report_id && (
                        <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold ml-2">LATEST</span>
                      )}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Metric Card: Hemoglobin */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hemoglobin</span>
                          <Droplet className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.hemoglobin}</span>
                          <span className="text-xs text-gray-500">g/dL</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('hemoglobin', selectedReport?.hemoglobin).color}`}>
                            {getMetricAnalysis('hemoglobin', selectedReport?.hemoglobin).status}
                          </span>
                        </div>
                      </div>

                      {/* Metric Card: Vitamin D */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vitamin D (25-OH)</span>
                          <Sparkles className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.vitamin_d}</span>
                          <span className="text-xs text-gray-500">ng/mL</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('vitamin_d', selectedReport?.vitamin_d).color}`}>
                            {getMetricAnalysis('vitamin_d', selectedReport?.vitamin_d).status}
                          </span>
                        </div>
                      </div>

                      {/* Metric Card: Cholesterol */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Cholesterol</span>
                          <Activity className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.cholesterol}</span>
                          <span className="text-xs text-gray-500">mg/dL</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('cholesterol', selectedReport?.cholesterol).color}`}>
                            {getMetricAnalysis('cholesterol', selectedReport?.cholesterol).status}
                          </span>
                        </div>
                      </div>

                      {/* Metric Card: Fasting Blood Sugar */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Fasting Glucose</span>
                          <Flame className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.blood_sugar_fasting}</span>
                          <span className="text-xs text-gray-500">mg/dL</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('blood_sugar_fasting', selectedReport?.blood_sugar_fasting).color}`}>
                            {getMetricAnalysis('blood_sugar_fasting', selectedReport?.blood_sugar_fasting).status}
                          </span>
                        </div>
                      </div>

                      {/* Metric Card: Creatinine */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Serum Creatinine</span>
                          <Droplet className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.creatinine}</span>
                          <span className="text-xs text-gray-500">mg/dL</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('creatinine', selectedReport?.creatinine).color}`}>
                            {getMetricAnalysis('creatinine', selectedReport?.creatinine).status}
                          </span>
                        </div>
                      </div>

                      {/* Metric Card: BMI */}
                      <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Body Mass Index (BMI)</span>
                          <User className="h-5 w-5 text-teal-400" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-extrabold text-white">{selectedReport?.bmi}</span>
                          <span className="text-xs text-gray-500">kg/m²</span>
                        </div>
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md border ${getMetricAnalysis('bmi', selectedReport?.bmi).color}`}>
                            {getMetricAnalysis('bmi', selectedReport?.bmi).status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor's Notes */}
                  {selectedReport?.doctor_notes && (
                    <div className="bg-gradient-to-r from-[#111827] to-[#1e293b] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                        <FileText className="h-44 w-44" />
                      </div>
                      <h4 className="text-white font-bold flex items-center space-x-2 text-sm tracking-wider uppercase mb-3">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        <span>Clinical Practitioner Notes</span>
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedReport.doctor_notes}</p>
                    </div>
                  )}

                  {/* Tabular History of Past Reports */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-emerald-500" />
                      <span>Historical Health Record Timeline</span>
                    </h3>

                    <div className="bg-slate-900/40 backdrop-blur border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-800/40 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 border-b border-white/5">
                              <th className="py-4 px-6">Report Date</th>
                              <th className="py-4 px-3 text-center">BMI</th>
                              <th className="py-4 px-3 text-center">Glucose</th>
                              <th className="py-4 px-3 text-center">Cholesterol</th>
                              <th className="py-4 px-3 text-center">Hemoglobin</th>
                              <th className="py-4 px-3 text-center">Urine Protein</th>
                              <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                            {history.map((report) => (
                              <tr 
                                key={report.report_id} 
                                className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedReport?.report_id === report.report_id ? 'bg-emerald-500/5' : ''}`}
                                onClick={() => setSelectedReport(report)}
                              >
                                <td className="py-4 px-6 font-semibold text-white">{formatDate(report.report_date)}</td>
                                <td className="py-4 px-3 text-center font-mono">{report.bmi}</td>
                                <td className="py-4 px-3 text-center font-mono">{report.blood_sugar_fasting}</td>
                                <td className="py-4 px-3 text-center font-mono">{report.cholesterol}</td>
                                <td className="py-4 px-3 text-center font-mono">{report.hemoglobin}</td>
                                <td className="py-4 px-3 text-center font-mono">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    report.urine_protein === 'Negative' || report.urine_protein === 'Nil' 
                                      ? 'text-emerald-400 bg-emerald-500/10' 
                                      : 'text-amber-400 bg-amber-500/10'
                                  }`}>
                                    {report.urine_protein}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button 
                                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 ml-auto text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedReport(report);
                                    }}
                                  >
                                    <span>Inspect</span>
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: User Profile Details Card */}
            <div className="space-y-8">
              <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-[0.02]">
                  <User className="h-44 w-44" />
                </div>
                
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4 mb-5 flex items-center space-x-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  <span>Demographic Profile</span>
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs tracking-wider uppercase font-semibold">Client identifier</span>
                    <span className="text-gray-300 font-bold font-mono">#{user?.client_id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 block text-xs tracking-wider uppercase font-semibold">Age / Gender</span>
                      <span className="text-gray-300">{user?.age} yrs, {user?.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs tracking-wider uppercase font-semibold">Mobile</span>
                      <span className="text-gray-300 font-mono">{user?.mobile}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-xs tracking-wider uppercase font-semibold">Geographical Location</span>
                    <span className="text-gray-300 flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>{user?.city}, {user?.state}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-xs tracking-wider uppercase font-semibold">Occupation</span>
                    <span className="text-gray-300 flex items-center space-x-1">
                      <Briefcase className="h-4 w-4 text-gray-500 shrink-0" />
                      <span>{user?.occupation || 'Not Specified'}</span>
                    </span>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <div>
                      <span className="text-emerald-500/80 block text-xs tracking-wider uppercase font-bold flex items-center space-x-1">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Health Condition Context</span>
                      </span>
                      <p className="text-gray-300 text-sm mt-1">{user?.health_condition || 'No conditions logged.'}</p>
                    </div>

                    <div>
                      <span className="text-teal-400/80 block text-xs tracking-wider uppercase font-bold flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Aesthetic & Beauty Goals</span>
                      </span>
                      <p className="text-gray-300 text-sm mt-1">{user?.beauty_goal || 'None specified.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
