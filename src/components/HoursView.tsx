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
          <div key={hour} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Hour Block Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                paddingBottom: '4px',
              }}
            >
              <Clock size={14} color="var(--accent-red)" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                {formatHourLabel(hour)}
              </h3>
            </div>

            {/* Acts inside this hour block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hourActs.map((act) => {
                const isFavorite = favorites.includes(act.id);

                return (
                  <div
                    key={act.id}
                    onClick={() => onSelectAct(act)}
                    className="glass"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      borderLeft: `4px solid var(--color-${act.stage.toLowerCase()})`,
                      transition: 'transform 0.15s, background-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                          {act.band}
                        </span>
                        {/* Day badge for global search results */}
                        {showGlobalDayBadge && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              background: '#2b3040',
                              color: 'var(--text-secondary)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: '600',
                            }}
                          >
                            {act.id.startsWith('2026-07-01') && 'Miércoles 1'}
                            {act.id.startsWith('2026-07-02') && 'Jueves 2'}
                            {act.id.startsWith('2026-07-03') && 'Viernes 3'}
                            {act.id.startsWith('2026-07-04') && 'Sábado 4'}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>
                          {act.start} - {act.end}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                          <MapPin size={10} />
                          {act.stage}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => onToggleFavorite(act.id, e)}
                      aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isFavorite ? 'var(--accent-red)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s, transform 0.1s',
                      }}
                      onMouseDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(0.85)'; }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <Zap
                        size={18}
                        fill={isFavorite ? 'var(--accent-red)' : 'none'}
                        strokeWidth={2}
                        style={{
                          filter: isFavorite ? 'drop-shadow(0 0 4px rgba(255, 0, 60, 0.5))' : 'none',
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
