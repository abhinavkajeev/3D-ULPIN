'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Play, AlertTriangle, AlertCircle, Info, CheckCircle2, Building2, ChevronDown, Eye } from 'lucide-react';
import Header from '@/components/layout/Header';
import { buildings } from '@/data/buildings';
import { parcels } from '@/data/parcels';
import { runFullValidation } from '@/lib/validationEngine';

export default function ValidationPage() {
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [results, setResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState(null);

  const handleValidate = async () => {
    if (!selectedBuildingId) return;
    setIsValidating(true);
    setResults(null);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 2000));

    const building = buildings.find(b => b.id === selectedBuildingId);
    const parcel = parcels.find(p => p.id === building?.parcelId);
    const result = runFullValidation(building, parcel, buildings);
    setResults(result);
    setIsValidating(false);
  };

  const severityIcons = {
    critical: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  };

  const severityStyles = {
    critical: 'border-l-4 border-critical bg-critical/5',
    warning: 'border-l-4 border-warning bg-warning/5',
    info: 'border-l-4 border-info bg-info/5',
  };

  const severityColors = {
    critical: 'text-critical',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-8 max-w-[900px] mx-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-green/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-accent-green" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Cadastral Validation Engine</h1>
          <p className="text-xs text-text-muted mt-1">Detect topology errors, overlaps, gaps, and spatial conflicts</p>
        </motion.div>

        {/* Building Selector */}
        <div className="glass rounded-xl p-5 mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-3">Select Building to Validate</p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full appearance-none bg-bg-tertiary border border-border rounded-lg px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer"
              >
                <option value="">Choose a building...</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name} — {b.zoneName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
            <button
              onClick={handleValidate}
              disabled={!selectedBuildingId || isValidating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed gradient-bg text-bg-primary hover:opacity-90 hover:shadow-glow-cyan"
            >
              <Play className="w-3.5 h-3.5" />
              {isValidating ? 'Validating...' : 'Run Validation'}
            </button>
          </div>
        </div>

        {/* Scanning Animation */}
        <AnimatePresence>
          {isValidating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-xl p-8 mb-6 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-1 gradient-bg animate-scan-line" />
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-text-primary">Running Topology Validation...</p>
              <p className="text-[10px] text-text-muted mt-1">Checking 2D/3D overlaps, gaps, containment, floor consistency</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className={`glass rounded-xl p-5 border ${
                results.status === 'PASSED' ? 'border-verified/30' :
                results.status === 'FAILED' ? 'border-critical/30' : 'border-warning/30'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      results.status === 'PASSED' ? 'bg-verified/10' :
                      results.status === 'FAILED' ? 'bg-critical/10' : 'bg-warning/10'
                    }`}>
                      {results.status === 'PASSED'
                        ? <CheckCircle2 className="w-5 h-5 text-verified" />
                        : <AlertTriangle className={`w-5 h-5 ${results.status === 'FAILED' ? 'text-critical' : 'text-warning'}`} />
                      }
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{results.buildingName}</h3>
                      <p className={`text-xs font-semibold ${
                        results.status === 'PASSED' ? 'text-verified' :
                        results.status === 'FAILED' ? 'text-critical' : 'text-warning'
                      }`}>{results.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-primary">{results.totalIssues}</p>
                    <p className="text-[10px] text-text-muted">Issues Found</p>
                  </div>
                </div>

                {/* Severity Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-critical">{results.summary.critical}</p>
                    <p className="text-[9px] text-text-muted">Critical</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-warning">{results.summary.warning}</p>
                    <p className="text-[9px] text-text-muted">Warnings</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-info">{results.summary.info}</p>
                    <p className="text-[9px] text-text-muted">Info</p>
                  </div>
                </div>
              </div>

              {/* Issue List */}
              <div className="space-y-2">
                {results.issues.map((issue, i) => {
                  const Icon = severityIcons[issue.severity];
                  const isExpanded = expandedIssue === issue.id;
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                        className={`w-full text-left rounded-xl p-4 transition-all cursor-pointer ${severityStyles[issue.severity]}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${severityColors[issue.severity]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-text-primary">{issue.title}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{issue.description}</p>
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-border"
                            >
                              <div className="space-y-2 text-[10px]">
                                <div>
                                  <span className="text-text-muted">Type: </span>
                                  <span className="text-text-secondary font-mono">{issue.type}</span>
                                </div>
                                <div>
                                  <span className="text-text-muted">Suggestion: </span>
                                  <span className="text-text-secondary">{issue.suggestion}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {results.issues.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-verified mx-auto mb-3" />
                  <p className="text-sm font-semibold text-verified">All Checks Passed!</p>
                  <p className="text-[10px] text-text-muted mt-1">No topology issues detected</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
