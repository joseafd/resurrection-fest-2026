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

export default function App() {
  const defaultStages = ["Main", "Ritual", "Chaos", "Desert"];

  // 1. Persistent State
  const [selectedDayId, setSelectedDayId] = useLocalStorage<string>('rf_selected_day', '2026-07-01');
  const [viewMode, setViewMode] = useLocalStorage<'hours' | 'stages'>('rf_view_mode', 'hours');
  const [favorites, setFavorites] = useLocalStorage<string[]>('rf_favorites', []);
  const [visibleStages, setVisibleStages] = useLocalStorage<string[]>('rf_visible_stages', defaultStages);
  const [stagesOrder, setStagesOrder] = useLocalStorage<string[]>('rf_stages_order', defaultStages);
  const [onlyFavorites, setOnlyFavorites] = useLocalStorage<boolean>('rf_only_favorites', false);

  // 2. UI State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchGlobal, setSearchGlobal] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // 3. Days list shortcut
  const days = festivalData.days;
  const currentDay = useMemo(() => {
    return days.find((day) => day.id === selectedDayId) || days[0];
  }, [days, selectedDayId]);

  // 4. Time filtering / sorting helpers
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

  // 5. Filtered acts computation
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
            fontSize: '0.85rem', /* Aumentado */
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
