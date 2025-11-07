'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface SEOHealthCheck {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    details?: string;
  }[];
}

export default function SEOHealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<SEOHealthCheck[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/seo/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data.checks);
        setLastChecked(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch SEO health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBg = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'bg-green-900/20 border-green-700/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700/30';
      case 'fail':
        return 'bg-red-900/20 border-red-700/30';
    }
  };

  const totalChecks = healthData.reduce((acc, cat) => acc + cat.checks.length, 0);
  const passedChecks = healthData.reduce(
    (acc, cat) => acc + cat.checks.filter(c => c.status === 'pass').length,
    0
  );
  const warningChecks = healthData.reduce(
    (acc, cat) => acc + cat.checks.filter(c => c.status === 'warning').length,
    0
  );
  const failedChecks = healthData.reduce(
    (acc, cat) => acc + cat.checks.filter(c => c.status === 'fail').length,
    0
  );
  const healthScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SEO Health Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor your website&apos;s SEO performance and identify issues
          </p>
        </div>
        <button
          onClick={fetchHealthData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon/80 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Health Score</p>
              <p className="text-3xl font-bold text-white mt-1">{healthScore}%</p>
            </div>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                healthScore >= 90
                  ? 'bg-green-900/30 text-green-400'
                  : healthScore >= 70
                  ? 'bg-yellow-900/30 text-yellow-400'
                  : 'bg-red-900/30 text-red-400'
              }`}
            >
              {healthScore}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-gray-400 text-sm">Passed</p>
              <p className="text-2xl font-bold text-white">{passedChecks}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-gray-400 text-sm">Warnings</p>
              <p className="text-2xl font-bold text-white">{warningChecks}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-2xl font-bold text-white">{failedChecks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-maroon" />
        </div>
      )}

      {/* Health Checks */}
      {!loading && (
        <div className="space-y-6">
          {healthData.map((category, idx) => (
            <div key={idx} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.checks.map((check, checkIdx) => (
                  <div
                    key={checkIdx}
                    className={`p-4 rounded-lg border ${getStatusBg(check.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <p className="font-medium text-white">{check.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-gray-500 mt-2">{check.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Last Checked */}
      {lastChecked && (
        <p className="text-sm text-gray-500 text-center">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}
    </div>
  );
}
