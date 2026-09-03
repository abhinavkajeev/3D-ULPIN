'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Shield, Eye, UserCircle2, Briefcase, Building2, ArrowRight } from 'lucide-react';
import useStore from '@/stores/useStore';

const roles = [
  {
    id: 'citizen',
    label: 'Citizen',
    subtitle: 'Property Owner / Buyer',
    icon: UserCircle2,
    color: '#00d4ff',
    features: ['View property details', 'Download certificates', 'Search ULPIN', 'View 3D map'],
  },
  {
    id: 'surveyor',
    label: 'Surveyor',
    subtitle: 'Licensed Land Surveyor',
    icon: Briefcase,
    color: '#14b8a6',
    features: ['Upload floor plans', 'Run validation checks', 'Generate ULPIN', 'AI building extraction'],
  },
  {
    id: 'admin',
    label: 'Government Admin',
    subtitle: 'Revenue Department Officer',
    icon: Building2,
    color: '#a855f7',
    features: ['Full dashboard access', 'Approve/reject records', 'Manage disputes', 'Infrastructure layers'],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUserRole } = useStore();
  const [selected, setSelected] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleLogin = () => {
    if (!selected) return;
    setUserRole(selected);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent-cyan/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-purple/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-border/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-glow-cyan"
          >
            <MapPin className="w-10 h-10 text-bg-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text mb-2">3D ULPIN Cadastral Portal</h1>
          <p className="text-sm text-text-muted">Ministry of Rural Development • Government of India</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Shield className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-[11px] text-accent-green font-medium">Secured with Digital India Authentication</span>
          </div>
        </div>

        {/* Role Selection */}
        <p className="text-xs text-text-muted text-center mb-4 uppercase tracking-widest">Select your role to continue</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            const isHovered = hoveredRole === role.id;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => setSelected(role.id)}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                className={`relative glass rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 group ${
                  isSelected
                    ? 'ring-2 shadow-lg'
                    : 'hover:bg-white/5'
                }`}
                style={{
                  ringColor: isSelected ? role.color : undefined,
                  borderColor: isSelected ? role.color + '40' : undefined,
                  boxShadow: isSelected ? `0 0 30px ${role.color}15` : undefined,
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="role-indicator"
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: role.color + '60' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: role.color + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: role.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mb-0.5">{role.label}</h3>
                  <p className="text-[10px] text-text-muted mb-3">{role.subtitle}</p>

                  <div className="space-y-1.5">
                    {role.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-text-muted/50 shrink-0" />
                        <span className="text-[10px] text-text-secondary">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Login Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleLogin}
          disabled={!selected}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 ${
            selected
              ? 'gradient-bg text-bg-primary hover:opacity-90 shadow-glow-cyan'
              : 'glass text-text-muted cursor-not-allowed'
          }`}
        >
          {selected ? (
            <>
              Continue as {roles.find(r => r.id === selected)?.label}
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            'Select a role to continue'
          )}
        </motion.button>

        {/* Footer */}
        <p className="text-center text-[9px] text-text-muted mt-6">
          Powered by Digital India • DILRMP • National Land Records Modernization Programme
        </p>
      </motion.div>
    </div>
  );
}
