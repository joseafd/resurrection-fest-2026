import React from 'react';
import { Zap, Clock, MapPin } from 'lucide-react';
import { DAY_START_HOUR } from '../data/festivalData';
import type { Act } from '../data/festivalData';

interface HoursViewProps {
  acts: Act[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectAct: (act: Act) => void;
  showGlobalDayBadge?: boolean;
}

export const HoursView: React.FC<HoursViewProps> = ({
  acts,
  favorites,
  onToggleFavorite,
  onSelectAct,
  showGlobalDayBadge = false,
}) => {
  if (acts.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '12px',
        }}
      >
        <Zap size={32} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: '0.9rem' }}>No se encontraron conciertos con los filtros actuales.</p>
      </div>
    );
  }

  // Helper to get adjusted hour (e.g. 15 for 15:25, 25 for 01:10)
  const getAdjustedHour = (act: Act): number => {
    const absoluteMinutes = act.startMinutes + (DAY_START_HOUR * 60);
    return Math.floor(absoluteMinutes / 60);
  };

  // Group acts by adjusted hour
  const groupedActs: Record<number, Act[]> = {};
  acts.forEach((act) => {
    const hour = getAdjustedHour(act);
    if (!groupedActs[hour]) {
      groupedActs[hour] = [];
    }
    groupedActs[hour].push(act);
  });

  // Sort the hours chronologically
  const sortedHours = Object.keys(groupedActs)
    .map(Number)
    .sort((a, b) => a - b);

  // Helper to format hour key for display (e.g. 25 -> "01:00")
  const formatHourLabel = (hour: number): string => {
    const displayHour = hour >= 24 ? hour - 24 : hour;
    return `${displayHour.toString().padStart(2, '0')}:00`;
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 8px',
        width: '100%',
      }}
      className="animate-fade-in-up"
    >
      <div className="responsive-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {sortedHours.map((hour) => {
        const hourActs = groupedActs[hour].sort((a, b) => a.startMinutes - b.startMinutes);

        return (
          <div key={hour} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Hour Block Header - More defined and marked */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '2px solid var(--accent-red)',
                paddingBottom: '6px',
                marginTop: '8px',
              }}
            >
              <Clock size={16} color="var(--accent-red)" />
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                {formatHourLabel(hour)}
              </h3>
            </div>

            {/* Acts inside this hour block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hourActs.map((act) => {
                const isFavorite = favorites.includes(act.id);
                const stageColor = `var(--color-${act.stage.toLowerCase()})`;

                return (
                  <div
                    key={act.id}
                    onClick={() => onSelectAct(act)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: stageColor, /* Solid Stage Color Background */
                      color: '#ffffff', /* High-contrast white text */
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                      transition: 'transform 0.15s, filter 0.15s, box-shadow 0.15s',
                    }}
                    className="btn-interactive"
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          {act.band}
                        </span>
                        {/* Day badge for global search results */}
                        {showGlobalDayBadge && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: 'rgba(0, 0, 0, 0.3)',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '700',
                            }}
                          >
                            {act.id.startsWith('2026-07-01') && 'Miércoles 1'}
                            {act.id.startsWith('2026-07-02') && 'Jueves 2'}
                            {act.id.startsWith('2026-07-03') && 'Viernes 3'}
                            {act.id.startsWith('2026-07-04') && 'Sábado 4'}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        <span style={{ fontWeight: '700' }}>
                          {act.start} - {act.end}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'rgba(255, 255, 255, 0.75)' }}>
                          <MapPin size={12} />
                          {act.stage} Stage
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => onToggleFavorite(act.id, e)}
                      aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isFavorite ? '#ffd600' : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s, color 0.2s',
                      }}
                      onMouseDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(0.85)'; }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Zap
                        size={20}
                        fill={isFavorite ? '#ffd600' : 'none'}
                        stroke={isFavorite ? '#ffd600' : '#ffffff'}
                        strokeWidth={2.2}
                        style={{
                          filter: isFavorite ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))' : 'none',
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
