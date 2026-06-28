import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { HoursView } from './components/HoursView';
import { StagesView } from './components/StagesView';
import { FilterDrawer } from './components/FilterDrawer';
import { BandDetailModal } from './components/BandDetailModal';
import { festivalData } from './data/festivalData';
import type { Act } from './data/festivalData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Calendar, Map, ArrowLeft, Info } from 'lucide-react';

export default function App() {
  const defaultStages = ["Main", "Ritual", "Chaos", "Desert"];

  // 1. App Navigation State (home, agenda, map, credits)
  const [activeTab, setActiveTab] = useState<'home' | 'agenda' | 'map' | 'credits'>('home');

  // 2. Persistent State
  const [selectedDayId, setSelectedDayId] = useLocalStorage<string>('rf_selected_day', '2026-07-01');
  const [viewMode, setViewMode] = useLocalStorage<'hours' | 'stages'>('rf_view_mode', 'hours');
  const [favorites, setFavorites] = useLocalStorage<string[]>('rf_favorites', []);
  const [visibleStages, setVisibleStages] = useLocalStorage<string[]>('rf_visible_stages', defaultStages);
  const [stagesOrder, setStagesOrder] = useLocalStorage<string[]>('rf_stages_order', defaultStages);
  const [onlyFavorites, setOnlyFavorites] = useLocalStorage<boolean>('rf_only_favorites', false);

  // 3. UI State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchGlobal, setSearchGlobal] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // 4. Days list shortcut
  const days = festivalData.days;
  const currentDay = useMemo(() => {
    return days.find((day) => day.id === selectedDayId) || days[0];
  }, [days, selectedDayId]);

  // 5. Time filtering / sorting helpers
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent opening details when favoriting
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleSelectAct = (act: Act) => {
    setSelectedAct(act);
    setIsDetailOpen(true);
  };

  const handleSaveFilters = (
    newOnlyFavorites: boolean,
    newVisibleStages: string[],
    newStagesOrder: string[]
  ) => {
    setOnlyFavorites(newOnlyFavorites);
    setVisibleStages(newVisibleStages);
    setStagesOrder(newStagesOrder);
  };

  // Determine if active filters exist (for red dot indicator in header)
  const hasActiveFilters = useMemo(() => {
    const isStagesModified = 
      visibleStages.length !== defaultStages.length ||
      stagesOrder.some((s, idx) => s !== defaultStages[idx]);
    return onlyFavorites || isStagesModified;
  }, [onlyFavorites, visibleStages, stagesOrder, defaultStages]);

  // 6. Filtered acts computation
  const filteredActs = useMemo(() => {
    // Determine scope of acts to filter (all days if searchGlobal is on, else current day)
    let actsPool: Act[] = [];
    if (searchGlobal && searchQuery.trim() !== '') {
      days.forEach((d) => {
        actsPool = [...actsPool, ...d.acts];
      });
    } else {
      actsPool = currentDay.acts;
    }

    return actsPool.filter((act) => {
      // Filter by search query
      const matchSearch = act.band.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by visible stages
      const matchStage = visibleStages.includes(act.stage);
      
      // Filter by favorites only switch
      const matchFavorite = !onlyFavorites || favorites.includes(act.id);

      return matchSearch && matchStage && matchFavorite;
    });
  }, [currentDay, days, searchQuery, searchGlobal, visibleStages, onlyFavorites, favorites]);

  // Render the selected view
  const renderView = () => {
    if (viewMode === 'hours') {
      return (
        <HoursView
          acts={filteredActs}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectAct={handleSelectAct}
          showGlobalDayBadge={searchGlobal && searchQuery.trim() !== ''}
        />
      );
    } else {
      // In stages view, sort rows according to stagesOrder
      const orderedVisibleStages = stagesOrder.filter((stage) => visibleStages.includes(stage));
      return (
        <StagesView
          acts={filteredActs}
          stages={orderedVisibleStages}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectAct={handleSelectAct}
        />
      );
    }
  };

  // ----------------------------------------------------
  // VIEW 1: HOME PAGE (PORTADA)
  // ----------------------------------------------------
  if (activeTab === 'home') {
    return (
      <div
        className="app-container animate-fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundImage: 'linear-gradient(rgba(8, 9, 13, 0.92), rgba(8, 9, 13, 0.92)), url("./images/FONDO.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="font-metal" style={{ fontSize: '2.1rem', lineHeight: 1.1 }}>RESURRECTION</h1>
          <span style={{ fontSize: '0.85rem', letterSpacing: '4px', color: 'var(--text-secondary)', fontWeight: 800 }}>FEST 2026</span>
        </div>

        {/* Portada Cover Container with Overlaid Buttons */}
        <div
          style={{
            maxWidth: '320px',
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
            background: '#12141c',
            position: 'relative',
          }}
        >
          {/* Cover image */}
          <img
            src="./images/PORTADA_RR.jpg"
            alt="Ressec 2026 Portada"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />

          {/* Linear dark gradient overlay to ensure text contrast for bottom buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '110px',
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0) 100%)',
              zIndex: 5,
            }}
          />

          {/* Horizontally aligned interior buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            {/* 1. Agenda Button */}
            <button
              onClick={() => setActiveTab('agenda')}
              style={{
                flex: 1,
                background: 'var(--accent-red)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 4px',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(255, 0, 60, 0.3)',
                transition: 'transform 0.1s',
              }}
              className="btn-interactive"
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Calendar size={14} />
              Agenda
            </button>

            {/* 2. Map Button */}
            <button
              onClick={() => setActiveTab('map')}
              style={{
                flex: 1,
                background: 'rgba(13, 15, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 4px',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'transform 0.1s',
              }}
              className="btn-interactive"
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Map size={14} color="var(--accent-red)" />
              Mapa
            </button>

            {/* 3. Credits Button */}
            <button
              onClick={() => setActiveTab('credits')}
              style={{
                flex: 1,
                background: 'rgba(13, 15, 20, 0.85)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 4px',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'transform 0.1s',
              }}
              className="btn-interactive"
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Info size={14} color="#ffd600" />
              Créditos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: MAP VIEWER
  // ----------------------------------------------------
  if (activeTab === 'map') {
    return (
      <div className="app-container animate-fade-in">
        {/* Simple Header for Map Viewer */}
        <header
          className="glass"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            borderTop: 'var(--safe-top) solid transparent',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => setActiveTab('home')}
            aria-label="Volver al inicio"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, transform 0.1s',
            }}
            className="btn-interactive"
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 className="font-metal" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>MAPA DEL RECINTO</h1>
            <span style={{ fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--text-secondary)', fontWeight: 800 }}>RESURRECTION FEST</span>
          </div>

          {/* Invisible spacer to balance back button */}
          <div style={{ width: '38px' }} />
        </header>

        {/* Scrollable Container with Zoomable Map */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '16px',
            background: '#08090d',
          }}
        >
          <img
            src="./images/MAPA.jpg"
            alt="Mapa del Resurrection Fest 2026"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          />
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 3: CREDITS VIEWER
  // ----------------------------------------------------
  if (activeTab === 'credits') {
    return (
      <div className="app-container animate-fade-in">
        {/* Header for Credits Viewer */}
        <header
          className="glass"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            borderTop: 'var(--safe-top) solid transparent',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => setActiveTab('home')}
            aria-label="Volver al inicio"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, transform 0.1s',
            }}
            className="btn-interactive"
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 className="font-metal" style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>CRÉDITOS</h1>
            <span style={{ fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--text-secondary)', fontWeight: 800 }}>RESURRECTION FEST</span>
          </div>

          <div style={{ width: '38px' }} />
        </header>

        {/* Scrollable Container with Credits Image & Clickable Social Icons */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px',
            background: '#08090d',
            gap: '24px',
          }}
        >
          {/* Credits Image Container with Overlaid Buttons */}
          <div
            style={{
              maxWidth: '320px',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
              background: '#12141c',
              position: 'relative',
            }}
          >
            <img
              src="./images/CREDITOS.jpg"
              alt="Créditos del Resurrection Fest"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />

            {/* Linear dark gradient overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90px',
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0) 100%)',
                zIndex: 5,
              }}
            />

            {/* Overlaid buttons at bottom inside image */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                zIndex: 10,
              }}
            >
              {/* Instagram Link */}
              <a
                href="https://www.instagram.com/joseantoniofd.photo/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 10px rgba(220, 39, 67, 0.3)',
                  transition: 'transform 0.1s',
                }}
                className="btn-interactive"
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
              </a>

              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/joseantoniofernandezphoto"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: '#1877f2',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  padding: '10px',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)',
                  transition: 'transform 0.1s',
                }}
                className="btn-interactive"
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 4: AGENDA (SCHEDULER)
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Central Header */}
      <Header
        days={days}
        selectedDayId={selectedDayId}
        onSelectDay={setSelectedDayId}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'hours' ? 'stages' : 'hours')}
        onOpenFilters={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters}
        onGoHome={() => setActiveTab('home')}
      />

      {/* Sleek Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchGlobal={searchGlobal}
        onSearchGlobalToggle={setSearchGlobal}
      />

      {/* Info indicator when searching globally */}
      {searchGlobal && searchQuery.trim() !== '' && (
        <div
          style={{
            background: 'rgba(255, 0, 60, 0.05)',
            borderBottom: '1px solid rgba(255, 0, 60, 0.1)',
            padding: '8px 16px',
            fontSize: '0.85rem',
            color: 'var(--accent-red)',
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          Mostrando resultados de todos los días ({filteredActs.length} encontrados)
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderView()}
      </main>

      {/* Filter and settings sidebar drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onlyFavorites={onlyFavorites}
        visibleStages={visibleStages}
        stagesOrder={stagesOrder}
        onSave={handleSaveFilters}
        defaultStages={defaultStages}
      />

      {/* Detailed information modal for band profiles */}
      <BandDetailModal
        act={selectedAct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedAct(null);
        }}
        isFavorite={selectedAct ? favorites.includes(selectedAct.id) : false}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
      />
    </div>
  );
}
