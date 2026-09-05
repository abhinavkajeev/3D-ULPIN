'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Map, Activity,
  Droplets, Zap, Flame, PipetteIcon, Server, Wifi, WifiOff, IndianRupee,
  Layers, AlertTriangle, ArrowUpRight, RefreshCw, Database, Landmark, MapPin,
  TrendingUp, Shield, Calendar, Hash, Ruler, ChevronRight
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const API_BASE = 'http://localhost:4000/api/v1';

// ─── Animated counter ───
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || typeof target !== 'number') return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Format currency ───
function formatCurrency(value) {
  if (!value) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

// ─── Skeleton loader ───
function Skeleton({ className = '', variant = 'default' }) {
  return (
    <div className={`rounded-lg ${variant === 'text' ? 'h-4' : ''} ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(30,41,59,0.5) 25%, rgba(51,65,85,0.4) 50%, rgba(30,41,59,0.5) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

// ─── Section Header ───
function SectionHeader({ icon: Icon, title, badge, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(168,85,247,0.08))' }}>
          <Icon className="w-4 h-4 text-accent-cyan" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-text-primary tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[9px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,212,255,0.08)', color: 'rgba(0,212,255,0.7)', border: '1px solid rgba(0,212,255,0.12)' }}>
            {badge}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ icon: Icon, label, value, suffix = '', color, delay = 0, subtext, isLoading, accentGradient }) {
  const count = useCounter(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group cursor-default"
    >
      {/* Card */}
      <div className="relative rounded-2xl p-5 transition-all duration-300 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(15,23,42,0.7), rgba(15,23,42,0.4))',
          border: '1px solid rgba(148,163,184,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${color}08 0%, transparent 60%)`,
            border: `1px solid ${color}20`,
          }}
        />

        {/* Top accent line */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60"
          style={{ background: accentGradient || `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}12`, border: `1px solid ${color}15` }}>
              <Icon className="w-[18px] h-[18px]" style={{ color }} />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <ArrowUpRight className="w-3.5 h-3.5" style={{ color }} />
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-28 mb-2" />
          ) : (
            <p className="text-[26px] font-bold font-mono text-text-primary leading-none tracking-tight">
              {typeof value === 'string' ? value : count.toLocaleString('en-IN')}{suffix}
            </p>
          )}
          <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.1em] font-medium">{label}</p>
          {subtext && (
            <p className="text-[10px] text-text-muted/50 mt-0.5 leading-relaxed">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Panel wrapper ───
function Panel({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(15,23,42,0.65), rgba(15,23,42,0.35))',
        border: '1px solid rgba(148,163,184,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Chart Tooltip ───
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3.5 py-2.5 text-xs backdrop-blur-xl"
        style={{
          background: 'rgba(15,23,42,0.92)',
          border: '1px solid rgba(0,212,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
        <p className="font-semibold text-text-primary text-[11px] mb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-text-muted">{entry.name}:</span>
            <span className="font-mono font-medium" style={{ color: entry.color }}>{entry.value?.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Infrastructure icons ───
const infraIcons = {
  water: { icon: Droplets, color: '#60a5fa', label: 'Water Pipelines', gradient: 'linear-gradient(135deg, #3b82f620, #60a5fa08)' },
  sewer: { icon: PipetteIcon, color: '#34d399', label: 'Sewer Lines', gradient: 'linear-gradient(135deg, #22c55e20, #34d39908)' },
  electrical: { icon: Zap, color: '#fbbf24', label: 'Electrical Cables', gradient: 'linear-gradient(135deg, #eab30820, #fbbf2408)' },
  gas: { icon: Flame, color: '#fb923c', label: 'Gas Pipelines', gradient: 'linear-gradient(135deg, #f9731620, #fb923c08)' },
};

// ─── Status colors ───
const statusColors = {
  verified: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  pending: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  disputed: { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

function StatusBadge({ status }) {
  const s = statusColors[status] || statusColors.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[9px] font-semibold tracking-wide uppercase"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.text }} />
      {status}
    </span>
  );
}

// ─── Zone type badge ───
function ZoneTypeBadge({ type }) {
  const map = {
    'residential-dense': { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    'residential-modern': { color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
    'commercial': { color: '#fb7185', bg: 'rgba(251,113,133,0.1)' },
    'mixed': { color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
    'institutional': { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  };
  const m = map[type] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span className="px-2 py-[3px] rounded-md text-[9px] font-semibold tracking-wide"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}18` }}>
      {type?.replace(/-/g, ' ')}
    </span>
  );
}

// ─── Building type chart colors ───
const buildingTypeColors = {
  residential: '#60a5fa',
  commercial: '#fb7185',
  mixed: '#c084fc',
  institutional: '#fbbf24',
  industrial: '#2dd4bf',
};

// ══════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`),
        fetch(`${API_BASE}/health`),
      ]);
      if (!statsRes.ok) throw new Error(`Stats API error: ${statsRes.status}`);
      const statsData = await statsRes.json();
      const healthData = await healthRes.json();
      setData(statsData);
      setHealth(healthData);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Chart data
  const zoneChartData = data?.zoneBreakdown?.map(z => ({
    name: z.name,
    parcels: z.parcels,
    buildings: z.buildings,
    units: z.units,
  })) || [];

  const unitStatusData = data ? [
    { name: 'Verified', value: data.unitStatus.verified, color: '#4ade80' },
    { name: 'Pending', value: data.unitStatus.pending, color: '#fbbf24' },
    { name: 'Disputed', value: data.unitStatus.disputed, color: '#f87171' },
  ] : [];

  const buildingTypeData = data?.buildingTypes?.map(bt => ({
    name: bt.type.charAt(0).toUpperCase() + bt.type.slice(1),
    value: bt.count,
    units: bt.totalUnits,
    fill: buildingTypeColors[bt.type] || '#64748b',
  })) || [];

  const monthlyData = data?.monthlyTrends?.map(m => {
    const [year, month] = m.month.split('-');
    const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { month: `${names[parseInt(month)]} '${year.slice(2)}`, registrations: m.registrations, verified: m.verified };
  }) || [];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-10 max-w-[1440px] mx-auto">
        {/* ─── Title Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-7"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Government Dashboard</h1>
              <span className="px-2.5 py-[3px] rounded-md text-[9px] font-bold tracking-wider uppercase"
                style={{ background: 'rgba(0,212,255,0.08)', color: 'rgba(0,212,255,0.8)', border: '1px solid rgba(0,212,255,0.15)' }}>
                LIVE
              </span>
            </div>
            <p className="text-[12px] text-text-muted flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Chennai District
              <span className="w-1 h-1 rounded-full bg-text-muted/40" />
              Real-time Cadastral Analytics
              <span className="w-1 h-1 rounded-full bg-text-muted/40" />
              PostGIS + ULPIN
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Health */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: health?.status === 'operational'
                  ? 'rgba(34,197,94,0.06)' : 'rgba(248,113,113,0.06)',
                border: `1px solid ${health?.status === 'operational' ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)'}`,
              }}>
              {health?.status === 'operational' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-semibold tracking-wide">ONLINE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[10px] text-red-400 font-semibold tracking-wide">OFFLINE</span>
                </>
              )}
            </div>
            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(148,163,184,0.08)',
              }}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-text-muted hover:text-accent-cyan transition-colors ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5"
              style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300 flex-1">{error}</p>
              <button onClick={fetchData} className="text-[10px] text-red-400 font-semibold hover:underline">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ KPI CARDS ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Map} label="Total Parcels" value={data?.overview.totalParcels}
            color="#00d4ff" delay={0} isLoading={loading}
            subtext={`${data?.overview.totalLandArea?.toLocaleString('en-IN') || '—'} sq.ft total area`}
            accentGradient="linear-gradient(90deg, transparent, #00d4ff, transparent)" />
          <StatCard icon={Building2} label="Total Buildings" value={data?.overview.totalBuildings}
            color="#a855f7" delay={0.08} isLoading={loading}
            subtext={`${data?.overview.totalFloors || '—'} floors • Avg ${data?.overview.avgBuildingHeight || '—'}m`}
            accentGradient="linear-gradient(90deg, transparent, #a855f7, transparent)" />
          <StatCard icon={Layers} label="Property Units" value={data?.overview.totalUnits}
            color="#14b8a6" delay={0.16} isLoading={loading}
            subtext="3D volumetric registrations"
            accentGradient="linear-gradient(90deg, transparent, #14b8a6, transparent)" />
          <StatCard icon={IndianRupee} label="Market Value"
            value={data ? formatCurrency(data.overview.totalMarketValue) : ''}
            color="#f59e0b" delay={0.24} isLoading={loading}
            subtext="Combined cadastral valuation"
            accentGradient="linear-gradient(90deg, transparent, #f59e0b, transparent)" />
        </div>

        {/* ═══ CHARTS ROW 1 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Zone Bar Chart */}
          <Panel delay={0.35}>
            <SectionHeader icon={BarChart} title="Properties by Zone" badge="PostGIS" />
            {loading ? <Skeleton className="h-[230px] w-full" /> : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={zoneChartData} barGap={3} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.04)' }} />
                  <Bar dataKey="buildings" fill="#a855f7" radius={[5, 5, 0, 0]} name="Buildings" />
                  <Bar dataKey="units" fill="#00d4ff" radius={[5, 5, 0, 0]} name="Units" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          {/* Validation Status Donut */}
          <Panel delay={0.4}>
            <SectionHeader icon={Shield} title="Unit Validation Status" />
            {loading ? <Skeleton className="h-[230px] w-full" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={unitStatusData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={58} outerRadius={85}
                      paddingAngle={3} strokeWidth={0}>
                      {unitStatusData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  {unitStatusData.map((item) => (
                    <div key={item.name} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded" style={{ background: item.color }} />
                          <span className="text-[11px] text-text-secondary font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-text-primary">{item.value.toLocaleString('en-IN')}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 rounded-full bg-bg-tertiary/50 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / data.overview.totalUnits) * 100}%` }}
                          transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted">Verification Rate</span>
                      <span className="text-xs font-bold font-mono" style={{ color: '#4ade80' }}>
                        {((data.unitStatus.verified / data.overview.totalUnits) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* ═══ CHARTS ROW 2 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Monthly Trends */}
          <Panel delay={0.5} className="lg:col-span-2">
            <SectionHeader icon={Calendar} title="Registration Trends" badge={`${monthlyData.length} months`} />
            {loading ? <Skeleton className="h-[230px] w-full" /> : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gradCyan2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGreen2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500 }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(monthlyData.length / 8))} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,212,255,0.15)' }} />
                  <Area type="monotone" dataKey="registrations" stroke="#00d4ff" fill="url(#gradCyan2)" name="Registrations" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="verified" stroke="#4ade80" fill="url(#gradGreen2)" name="Verified" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Panel>

          {/* Building Types */}
          <Panel delay={0.55}>
            <SectionHeader icon={Building2} title="Building Types" />
            {loading ? <Skeleton className="h-[230px] w-full" /> : (
              <>
                <ResponsiveContainer width="100%" height={145}>
                  <PieChart>
                    <Pie data={buildingTypeData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={60} strokeWidth={0}>
                      {buildingTypeData.map((entry, i) => (
                        <Cell key={`btype-${i}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {buildingTypeData.map(bt => (
                    <div key={bt.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-bg-tertiary/20">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: bt.fill }} />
                      <span className="text-[10px] text-text-secondary font-medium flex-1 truncate">{bt.name}</span>
                      <span className="text-[10px] font-mono font-semibold text-text-primary">{bt.value}</span>
                      <span className="text-[9px] font-mono text-text-muted">({bt.units} units)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* ═══ INFRASTRUCTURE ═══ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
          <SectionHeader icon={Database} title="Underground Infrastructure" badge={`${Object.keys(data?.infrastructure?.underground || {}).length} types`} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            ) : (
              Object.entries(data?.infrastructure?.underground || {}).map(([type, info], idx) => {
                const meta = infraIcons[type] || { icon: Layers, color: '#64748b', label: type, gradient: 'transparent' };
                const IconComp = meta.icon;
                return (
                  <motion.div key={type}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.06 }}
                    className="rounded-xl p-4 group transition-all duration-300"
                    style={{
                      background: meta.gradient,
                      border: `1px solid ${meta.color}12`,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}20` }}>
                        <IconComp className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-text-primary leading-tight">{meta.label}</p>
                        <p className="text-[9px] text-text-muted font-mono">{info.count} line{info.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-text-muted flex items-center gap-1"><Ruler className="w-3 h-3" /> Length</span>
                        <span className="font-mono font-semibold text-text-secondary">{info.totalLengthKm} km</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-text-muted flex items-center gap-1"><Layers className="w-3 h-3" /> Depth</span>
                        <span className="font-mono font-semibold text-text-secondary">{info.avgDepthM}m</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          {data && (
            <div className="flex gap-3 mt-3">
              {[
                { icon: Landmark, color: '#c084fc', text: `${data.infrastructure.elevated} Elevated Structure${data.infrastructure.elevated !== 1 ? 's' : ''}` },
                { icon: Layers, color: '#fbbf24', text: `${data.infrastructure.airRights} Air Right${data.infrastructure.airRights !== 1 ? 's' : ''}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}12` }}>
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  <span className="text-[10px] font-medium" style={{ color: item.color }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══ ZONE ANALYTICS TABLE ═══ */}
        <Panel delay={0.75} className="mb-6 overflow-x-auto">
          <SectionHeader icon={MapPin} title="Zone Analytics" badge={`${data?.zoneBreakdown?.length || 0} zones`} />
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-left min-w-[650px]">
                <thead>
                  <tr>
                    {['Zone', 'Ward', 'Type', 'Parcels', 'Buildings', 'Units', 'Market Value'].map(h => (
                      <th key={h} className="text-[9px] text-text-muted font-semibold uppercase tracking-[0.12em] pb-3 px-2"
                        style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.zoneBreakdown?.map((z, i) => (
                    <motion.tr key={z.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.85 + i * 0.04 }}
                      className="group hover:bg-white/[0.02] transition-colors cursor-default"
                    >
                      <td className="py-3 px-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-text-primary">{z.name}</span>
                          <span className="text-[9px] text-text-muted/60 font-mono">{z.code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[11px] text-text-secondary" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}>{z.ward}</td>
                      <td className="py-3 px-2" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}><ZoneTypeBadge type={z.type} /></td>
                      <td className="py-3 px-2 text-[12px] font-mono font-semibold text-text-primary" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}>{z.parcels}</td>
                      <td className="py-3 px-2 text-[12px] font-mono font-semibold text-text-primary" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}>{z.buildings}</td>
                      <td className="py-3 px-2 text-[12px] font-mono font-semibold text-text-primary" style={{ borderBottom: '1px solid rgba(148,163,184,0.04)' }}>{z.units}</td>
                      <td className="py-3 px-2 text-[12px] font-mono font-semibold" style={{ color: '#fbbf24', borderBottom: '1px solid rgba(148,163,184,0.04)' }}>{formatCurrency(z.marketValue)}</td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 px-2 text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>Totals</td>
                    <td className="py-3 px-2 text-[13px] font-bold font-mono text-accent-cyan" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>{data?.overview.totalParcels}</td>
                    <td className="py-3 px-2 text-[13px] font-bold font-mono text-accent-cyan" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>{data?.overview.totalBuildings}</td>
                    <td className="py-3 px-2 text-[13px] font-bold font-mono text-accent-cyan" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>{data?.overview.totalUnits}</td>
                    <td className="py-3 px-2 text-[13px] font-bold font-mono" style={{ color: '#fbbf24', borderTop: '1px solid rgba(148,163,184,0.1)' }}>{data && formatCurrency(data.overview.totalMarketValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Panel>

        {/* ═══ ACTIVITY + SYSTEM ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Registrations */}
          <Panel delay={0.85} className="lg:col-span-2">
            <SectionHeader icon={Activity} title="Recent Registrations" />
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-1">
                {data?.recentActivity?.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.95 + i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group cursor-default"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Timeline */}
                    <div className="flex flex-col items-center w-5 self-stretch">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: statusColors[item.status]?.text || '#64748b' }} />
                      {i < (data.recentActivity.length - 1) && (
                        <div className="w-px flex-1 mt-1" style={{ background: 'rgba(148,163,184,0.08)' }} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        <span className="font-semibold text-text-primary">{item.owner}</span>
                        {' '}registered Unit {item.unitNumber} (Floor {item.floor}) at{' '}
                        <span className="font-medium" style={{ color: '#00d4ff' }}>{item.buildingName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-text-muted/60 font-mono">{item.registrationDate}</span>
                        <StatusBadge status={item.status} />
                        <span className="text-[9px] font-mono font-semibold" style={{ color: '#fbbf24' }}>{formatCurrency(item.marketValue)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            )}
          </Panel>

          {/* System Status */}
          <Panel delay={0.9}>
            <SectionHeader icon={Server} title="System Status" />
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (
              <div className="space-y-3">
                {/* Services */}
                {[
                  { name: 'Backend API', value: health?.status || 'unknown', ok: health?.status === 'operational' },
                  { name: 'PostGIS Database', value: `v${health?.postgisVersion?.split(' ')[0] || '—'}`, ok: !!health?.postgisVersion },
                ].map((svc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: svc.ok ? 'rgba(34,197,94,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${svc.ok ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)'}` }}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${svc.ok ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className="text-[11px] text-text-secondary font-medium">{svc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold" style={{ color: svc.ok ? '#4ade80' : '#f87171' }}>{svc.value}</span>
                  </div>
                ))}

                {/* Details */}
                <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.06)' }}>
                  {[
                    { label: 'Service', value: health?.service || '—' },
                    { label: 'Version', value: health?.version || '—' },
                    { label: 'Uptime', value: health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '—' },
                    { label: 'DB Parcels', value: health?.totalParcels || '—' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-text-muted">{row.label}</span>
                      <span className="text-text-secondary font-mono font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                {lastRefresh && (
                  <p className="text-[9px] text-text-muted/50 text-center pt-1 font-mono">
                    Refreshed {lastRefresh.toLocaleTimeString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}
