import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ─── View State ───
  viewMode: '3d', // '3d' | 'map' | 'split'
  setViewMode: (mode) => set({ viewMode: mode }),

  // ─── Selection State ───
  selectedParcel: null,
  selectedBuilding: null,
  selectedFloor: null,
  selectedUnit: null,
  mapOffsetX: 0,
  mapOffsetZ: 0,
  mapRotationY: 0,

  setMapOffset: (x, z, rotY) => set({ mapOffsetX: x, mapOffsetZ: z, mapRotationY: rotY }),

  selectParcel: (parcel) => set({
    selectedParcel: parcel,
    selectedBuilding: null,
    selectedFloor: null,
    selectedUnit: null,
  }),
  selectBuilding: (building) => set({
    selectedBuilding: building,
    selectedFloor: null,
    selectedUnit: null,
  }),
  selectFloor: (floor) => set({
    selectedFloor: floor,
    selectedUnit: null,
  }),
  selectUnit: (unit) => set({ selectedUnit: unit }),
  clearSelection: () => set({
    selectedParcel: null,
    selectedBuilding: null,
    selectedFloor: null,
    selectedUnit: null,
    isExploded: false,
  }),

  // ─── Exploded View ───
  isExploded: false,
  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),
  setExploded: (val) => set({ isExploded: val }),

  // ─── Drag Mode ───
  dragMode: 'pan', // 'pan' | 'rotate'
  toggleDragMode: () => set((s) => ({ dragMode: s.dragMode === 'pan' ? 'rotate' : 'pan' })),

  // ─── Layer Visibility ───
  layers: {
    parcels: true,
    buildings: true,
    roads: true,
    adminBoundaries: true,
    underground: false,
    waterPipelines: false,
    sewerLines: false,
    electricalLines: false,
    gasLines: false,
    airRights: false,
    elevatedStructures: false,
    floorBoundaries: false,
    dem: false,
    dsm: false,
    lidar: false,
  },
  toggleLayer: (layer) => set((s) => ({
    layers: { ...s.layers, [layer]: !s.layers[layer] },
  })),
  setLayer: (layer, value) => set((s) => ({
    layers: { ...s.layers, [layer]: value },
  })),

  // ─── Sidebar ───
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ─── Right Panel ───
  rightPanel: null, // 'building' | 'floor' | 'property' | 'ulpin' | 'validation' | 'certificate'
  setRightPanel: (panel) => set({ rightPanel: panel }),
  closeRightPanel: () => set({ rightPanel: null }),

  // ─── User Role ───
  userRole: 'citizen', // 'citizen' | 'surveyor' | 'admin'
  setUserRole: (role) => set({ userRole: role }),

  // ─── ULPIN Generator ───
  ulpinStep: 0,
  generatedUlpin: null,
  setUlpinStep: (step) => set({ ulpinStep: step }),
  setGeneratedUlpin: (ulpin) => set({ generatedUlpin: ulpin }),
  resetUlpin: () => set({ ulpinStep: 0, generatedUlpin: null }),

  // ─── Validation ───
  validationResults: null,
  isValidating: false,
  setValidationResults: (results) => set({ validationResults: results, isValidating: false }),
  startValidation: () => set({ isValidating: true, validationResults: null }),

  // ─── Search ───
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),

  // ─── Hover State (for 3D scene) ───
  hoveredBuilding: null,
  setHoveredBuilding: (id) => set({ hoveredBuilding: id }),

  // ─── Camera Target (for animated transitions) ───
  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));

export default useStore;
