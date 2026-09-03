'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2, LayoutDashboard, Fingerprint, ShieldCheck, BrainCircuit, FileCode2,
  ChevronDown, Menu, X, Search, MapPin, Building2, User2, LogOut
} from 'lucide-react';
import useStore from '@/stores/useStore';
import { buildings } from '@/data/buildings';
import { parcels } from '@/data/parcels';

const navItems = [
  { href: '/', label: '3D Viewer', icon: Globe2 },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ulpin', label: 'ULPIN Generator', icon: Fingerprint },
  { href: '/validation', label: 'Validation', icon: ShieldCheck },
  { href: '/ai-engine', label: 'AI Engine', icon: BrainCircuit },
  { href: '/standards', label: 'Standards', icon: FileCode2 },
];

const roles = [
  { id: 'citizen', label: 'Citizen', color: 'text-accent-cyan' },
  { id: 'surveyor', label: 'Surveyor', color: 'text-accent-teal' },
  { id: 'admin', label: 'Admin', color: 'text-accent-purple' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, setUserRole, searchQuery, setSearchQuery } = useStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const currentRole = roles.find(r => r.id === userRole);

  // Search functionality
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = [];

    // Search dynamic city buildings from active 3D view
    const allBuildings = (typeof window !== 'undefined' && window.__CITY_BUILDINGS__) || buildings;
    allBuildings.forEach(b => {
      if (b.name?.toLowerCase().includes(q) || b.id?.toLowerCase().includes(q)) {
        results.push({ type: 'building', id: b.id, label: b.name || b.id, sub: `${b.floors} floors • ${b.type}`, icon: 'building', building: b });
      }
    });

    // Search parcels
    parcels.forEach(p => {
      if (p.surveyNumber?.toLowerCase().includes(q) || p.owner?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)) {
        results.push({ type: 'parcel', id: p.id, label: p.surveyNumber, sub: `${p.owner} • ${p.zoneName}`, icon: 'parcel' });
      }
    });

    // Search ULPIN pattern e.g. TN-CHN-VAD-TS1082-B01-F04-U402
    if (q.includes('tn-') || q.includes('chn') || q.includes('vad') || q.includes('b0') || q.includes('f0') || q.includes('u0') || q.includes('b1')) {
      // Parse building code (e.g. B01, B02, B03, B1053)
      const bldgMatch = q.match(/b(\d+)/i);
      const bldgIndex = bldgMatch ? parseInt(bldgMatch[1], 10) : 1;
      
      // Parse floor number (e.g. F02 -> 2, F04 -> 4)
      const floorMatch = q.match(/f(\d+)/i);
      const floorNum = floorMatch ? parseInt(floorMatch[1], 10) : 2;
      
      // Parse unit number (e.g. U201, U402)
      const unitMatch = q.match(/u(\d+)/i);
      const unitNum = unitMatch ? parseInt(unitMatch[1], 10) : (floorNum * 100 + 1);

      results.push({
        type: 'ulpin',
        id: q.toUpperCase(),
        label: q.toUpperCase(),
        sub: `Building ${bldgIndex} • Floor ${floorNum} • Unit ${unitNum}`,
        icon: 'ulpin',
        buildingIndex: bldgIndex,
        floor: floorNum,
        unitNumber: unitNum
      });
    }

    setSearchResults(results.slice(0, 8));
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result) => {
    setSearchFocused(false);
    setSearchQuery('');
    const allBuildings = (typeof window !== 'undefined' && window.__CITY_BUILDINGS__) || buildings;

    if (result.type === 'building') {
      const building = allBuildings.find(b => b.id === result.id) || result.building;
      if (building) {
        useStore.getState().selectBuilding(building);
        useStore.getState().setRightPanel('building');
        if (pathname !== '/') router.push('/');
      }
    } else if (result.type === 'ulpin') {
      // Map building code (B01, B02, B03, etc.) to the real corresponding building in the 3D city
      const bIndex = result.buildingIndex ? (result.buildingIndex - 1) % allBuildings.length : 0;
      const targetBldg = allBuildings[bIndex] || allBuildings[0];

      if (targetBldg) {
        const floorToHighlight = Math.min(Math.max(1, result.floor || 2), targetBldg.floors || 4);
        const unitNumber = result.unitNumber || (floorToHighlight * 100 + 1);

        // Build unit data for the property panel
        const unitObj = targetBldg.units?.find(u => u.floor === floorToHighlight) || {
          unitNumber: unitNumber,
          floor: floorToHighlight,
          name: `${targetBldg.name} - Unit ${unitNumber}`,
          status: 'verified',
          area: Math.floor(750 + (unitNumber % 5) * 120),
          elevation: floorToHighlight * (targetBldg.floorHeight || 3.5),
          height: targetBldg.floorHeight || 3.5,
          registrationDate: '2023-11-20',
          marketValue: 8500000 + (unitNumber % 8) * 500000
        };

        // Batch ALL state updates into one atomic Zustand set() so React
        // renders the final state in a single pass — building + exploded + floor + unit
        useStore.setState({
          selectedBuilding: targetBldg,
          isExploded: true,
          selectedFloor: floorToHighlight,
          selectedUnit: unitObj,
          rightPanel: 'property',
        });

        if (pathname !== '/') router.push('/');
      }
    } else if (result.type === 'parcel') {
      const parcel = parcels.find(p => p.id === result.id);
      if (parcel) {
        useStore.getState().selectParcel(parcel);
        useStore.getState().setRightPanel('parcel');
        if (pathname !== '/') router.push('/');
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-glow-cyan">
            <MapPin className="w-5 h-5 text-bg-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold gradient-text leading-tight">3D Cadastre</h1>
            <p className="text-[10px] text-text-muted leading-tight">ULPIN Portal</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 no-underline ${
                  isActive
                    ? 'text-accent-cyan bg-accent-cyan/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 gradient-bg rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={searchRef} className="hidden md:block relative">
            <div className={`flex items-center gap-2 glass rounded-lg px-3 py-1.5 transition-all duration-300 ${searchFocused ? 'w-72 glow-border' : 'w-48'}`}>
              <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search ULPIN, building, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="bg-transparent border-none outline-none text-xs text-text-primary placeholder:text-text-muted w-full"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="cursor-pointer">
                  <X className="w-3 h-3 text-text-muted" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-strong rounded-xl overflow-hidden shadow-lg max-h-80 overflow-y-auto"
                >
                  {searchResults.map((result, i) => (
                    <button
                      key={`${result.type}-${result.id}-${i}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-white/5 transition-colors border-b border-border/30 last:border-0"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        result.type === 'building' ? 'bg-accent-purple/15' :
                        result.type === 'parcel' ? 'bg-accent-cyan/15' : 'bg-accent-green/15'
                      }`}>
                        {result.type === 'building' ? <Building2 className="w-3.5 h-3.5 text-accent-purple" /> :
                         result.type === 'parcel' ? <MapPin className="w-3.5 h-3.5 text-accent-cyan" /> :
                         <Fingerprint className="w-3.5 h-3.5 text-accent-green" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{result.label}</p>
                        <p className="text-[10px] text-text-muted truncate">{result.sub}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Role Selector */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 glass rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                userRole === 'citizen' ? 'bg-accent-cyan' :
                userRole === 'surveyor' ? 'bg-accent-teal' : 'bg-accent-purple'
              }`} />
              <span className="text-text-secondary hidden sm:inline">{currentRole?.label}</span>
              <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {roleDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 glass-strong rounded-xl overflow-hidden shadow-lg min-w-[160px]"
                >
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => { setUserRole(role.id); setRoleDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                        userRole === role.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        role.id === 'citizen' ? 'bg-accent-cyan' :
                        role.id === 'surveyor' ? 'bg-accent-teal' : 'bg-accent-purple'
                      }`} />
                      {role.label}
                    </button>
                  ))}
                  <div className="border-t border-border/30">
                    <button
                      onClick={() => { setRoleDropdownOpen(false); router.push('/login'); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors text-text-muted hover:text-accent-rose hover:bg-accent-rose/5"
                    >
                      <LogOut className="w-3 h-3" />
                      Switch Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-text-secondary" /> : <Menu className="w-5 h-5 text-text-secondary" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-strong border-t border-border overflow-hidden"
          >
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-colors ${
                      isActive ? 'text-accent-cyan bg-accent-cyan/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
