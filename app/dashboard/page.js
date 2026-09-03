'use client';

import { motion } from 'framer-motion';
import { BarChart3, Building2, Map, ShieldAlert, CheckCircle2, Clock, TrendingUp, Activity } from 'lucide-react';
import Header from '@/components/layout/Header';
import { buildings } from '@/data/buildings';
import { parcels } from '@/data/parcels';
import { zones } from '@/data/zones';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';

// Animated counter hook
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
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

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  const count = useCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 hover:glow-border transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: color + '15' }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-accent-green opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-2xl font-bold font-mono text-text-primary">{count.toLocaleString()}</p>
      <p className="text-[11px] text-text-muted mt-1">{label}</p>
    </motion.div>
  );
}

const chartColors = ['#00d4ff', '#a855f7', '#14b8a6', '#f59e0b', '#f43f5e'];

const zoneData = zones.map(z => ({
  name: z.name,
  parcels: Math.floor(Math.random() * 3000) + 1500,
  buildings: Math.floor(Math.random() * 2000) + 800,
}));

const statusData = [
  { name: 'Verified', value: 38204, color: '#22c55e' },
  { name: 'Pending', value: 3981, color: '#f59e0b' },
  { name: 'Disputed', value: 127, color: '#f43f5e' },
];

const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  registrations: Math.floor(Math.random() * 500) + 200,
  validations: Math.floor(Math.random() * 300) + 100,
}));

const activities = [
  { id: 1, text: 'ULPIN TN-CHN-TNR-TS0423-B01-F04-U401 generated', time: '2 min ago', type: 'ulpin', color: '#00d4ff' },
  { id: 2, text: 'Validation conflict resolved — Parcel TS-43/1', time: '15 min ago', type: 'validation', color: '#22c55e' },
  { id: 3, text: 'New building registered — Anna Nagar Grand Tower', time: '1 hr ago', type: 'building', color: '#a855f7' },
  { id: 4, text: 'Ownership dispute flagged — Luz Corner Complex', time: '2 hrs ago', type: 'dispute', color: '#f43f5e' },
  { id: 5, text: 'Floor plan uploaded — Murugan Enclave', time: '3 hrs ago', type: 'upload', color: '#f59e0b' },
  { id: 6, text: 'Building survey completed — Mylapore Heritage', time: '5 hrs ago', type: 'survey', color: '#14b8a6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-3 py-2 text-xs">
        <p className="font-semibold text-text-primary">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-[10px]">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const totalUnits = buildings.reduce((sum, b) => sum + b.totalUnits, 0);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-8 max-w-[1400px] mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl font-bold gradient-text">Government Dashboard</h1>
          <p className="text-xs text-text-muted mt-1">Chennai District • Real-time Cadastral Analytics</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Map} label="Total Parcels" value={12450} color="#00d4ff" delay={0} />
          <StatCard icon={Building2} label="Total Buildings" value={8921} color="#a855f7" delay={0.1} />
          <StatCard icon={BarChart3} label="3D Property Units" value={totalUnits} color="#14b8a6" delay={0.2} />
          <StatCard icon={ShieldAlert} label="Active Conflicts" value={127} color="#f43f5e" delay={0.3} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Properties by Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Properties by Zone</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="parcels" fill="#00d4ff" radius={[4, 4, 0, 0]} name="Parcels" />
                <Bar dataKey="buildings" fill="#a855f7" radius={[4, 4, 0, 0]} name="Buildings" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Validation Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Validation Status</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{item.value.toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Trends & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="registrations" stroke="#00d4ff" fill="url(#gradCyan)" name="Registrations" />
                <Area type="monotone" dataKey="validations" stroke="#a855f7" fill="url(#gradPurple)" name="Validations" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-accent-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {activities.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: item.color }} />
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-[11px] text-text-secondary leading-relaxed">{item.text}</p>
                    <p className="text-[9px] text-text-muted mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
