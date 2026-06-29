import React, { useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import type { Act } from '../data/festivalData';

const getStageGlassStyle = (stage: string, isPlayingNow: boolean, isFavorite: boolean) => {
  const lower = stage.toLowerCase();
  let rgb = "211, 19, 60"; // Main (Red)
  let borderAlpha = isPlayingNow ? "0.8" : (isFavorite ? "0.55" : "0.3");
  let bgAlpha = isPlayingNow ? "0.2" : "0.1";
  
  if (lower === 'ritual') {
    rgb = "43, 139, 227"; // Blue
  } else if (lower === 'chaos') {
    rgb = "156, 31, 184"; // Purple
  } else if (lower === 'desert') {
    rgb = "230, 126, 34"; // Orange
  }
  
  return {
    background: `rgba(${rgb}, ${bgAlpha})`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid rgba(${rgb}, ${borderAlpha})`,
    boxShadow: isPlayingNow 
      ? `0 0 16px rgba(${rgb}, 0.35)` 
      : (isFavorite ? `0 0 10px rgba(${rgb}, 0.2)` : `0 4px 12px rgba(0, 0, 0, 0.4)`),
  };
};

interface StagesViewProps {
  acts: Act[];
  stages: string[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectAct: (act: Act) => void;
  currentTimeMinutes: number;
  shouldShowLive: boolean;
  conflictActIds: Set<string>;
}

export const StagesView: React.FC<StagesViewProps> = ({
  acts,
  stages,
  favorites,
  onToggleFavorite,
  onSelectAct,
  currentTimeMinutes,
  shouldShowLive,
  conflictActIds,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const MINUTE_WIDTH = 3.6; // Aumentado para dar más espacio horizontal (1 min = 3.6px, 40 min = 144px)
  const HOUR_WIDTH = 60 * MINUTE_WIDTH; // 1 hora = 216px
  const TIMELINE_START_HOUR = 14; // Start at 14:00
  const TIMELINE_END_HOUR = 28; // End at 04:00 next morning (28:00)
  const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 14 hours
  const TIMELINE_WIDTH = TOTAL_HOURS * HOUR_WIDTH; // 3024px

  // Auto-scroll to the first act of the day when day changes
  useEffect(() => {
    if (scrollContainerRef.current && acts.length > 0) {
      // Find the earliest startMinutes among acts
      const earliestStart = Math.min(...acts.map(a => a.startMinutes));
      // Scroll to that position (minus a bit of margin so it's not glued to the left edge)
      const scrollPos = Math.max(0, earliestStart * MINUTE_WIDTH - 60);
      scrollContainerRef.current.scrollLeft = scrollPos;
    }
  }, [acts]);

  // Generate half-hour marks for the header and vertical grid lines
  const hourMarks = [];
  const HALF_HOUR_WIDTH = 30 * MINUTE_WIDTH; // 30 minutes = 75px
  const TOTAL_HALF_HOURS = TOTAL_HOURS * 2; // 28 half-hour blocks
  for (let i = 0; i <= TOTAL_HALF_HOURS; i++) {
    const totalMinutes = i * 30;
    const adjustedHour = TIMELINE_START_HOUR + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const displayHour = adjustedHour >= 24 ? adjustedHour - 24 : adjustedHour;
    const timeStr = `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    hourMarks.push({
      timeStr,
      offset: i * HALF_HOUR_WIDTH,
      isHalfHour: minutes === 30,
    });
  }

  // Filter acts belonging to visible stages
  const actsByStage: Record<string, Act[]> = {};
  stages.forEach((stage) => {
    actsByStage[stage] = acts.filter((act) => act.stage === stage);
  });

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'rgba(27, 29, 36, 0.7)', /* Gris al 70% */
      }}
      className="animate-fade-in"
    >
      {/* Scroll Wrapper */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Inner Scrollable Timeline Grid */}
        <div
          style={{
            width: `${TIMELINE_WIDTH + 80}px`, // Timeline + Stage header width
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flex: 1,
            minHeight: '450px',
          }}
        >
          {/* 1. TIMELINE HOURS HEADER */}
          <div
            style={{
              height: '40px',
              display: 'flex',
              position: 'sticky',
              top: 0,
              zIndex: 30,
              background: 'rgba(13, 15, 20, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Corner spacer for sticky stage header */}
            <div
              style={{
                width: '80px',
                background: 'rgba(13, 15, 20, 0.95)',
                position: 'sticky',
                left: 0,
                zIndex: 40,
                borderRight: '1px solid var(--border-color)',
              }}
            />
            {/* Time labels */}
            <div style={{ position: 'relative', width: `${TIMELINE_WIDTH}px`, height: '100%' }}>
              {hourMarks.map((mark, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${mark.offset}px`,
                    transform: 'translateX(-50%)',
                    top: mark.isHalfHour ? '12px' : '10px',
                    fontSize: mark.isHalfHour ? '0.75rem' : '0.85rem',
                    fontWeight: mark.isHalfHour ? '500' : '800',
                    color: mark.isHalfHour ? 'rgba(255, 255, 255, 0.6)' : '#ffffff',
                    letterSpacing: '0.5px',
                  }}
                >
                  {mark.timeStr}
                </div>
              ))}
            </div>
          </div>

          {/* 2. GRID LANES AND VERTICAL GRID LINES */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1 }}>
            
            {/* Hour vertical grid lines background */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '80px',
                width: `${TIMELINE_WIDTH}px`,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {hourMarks.map((mark, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${mark.offset}px`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    borderLeft: mark.isHalfHour
                      ? '1px dashed rgba(255, 255, 255, 0.12)' // Línea discontinua para las medias horas
                      : '1px solid rgba(255, 255, 255, 0.22)', // Línea sólida para las horas enteras
                  }}
                />
              ))}

              {/* Red vertical time line representing current time */}
              {shouldShowLive && currentTimeMinutes >= 0 && currentTimeMinutes < (14 * 60) && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${currentTimeMinutes * MINUTE_WIDTH}px`,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: '#ff003c',
                    boxShadow: '0 0 8px #ff003c',
                    zIndex: 10,
                  }}
                />
              )}
            </div>

            {/* Stage lanes */}
            {stages.map((stage) => {
              const stageActs = actsByStage[stage] || [];
              const stageColor = `var(--color-${stage.toLowerCase()})`;

              return (
                <div
                  key={stage}
                  style={{
                    height: '95px',
                    display: 'flex',
                    position: 'relative',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    zIndex: 2,
                  }}
                >
                  {/* Sticky left Stage Title Card */}
                  <div
                    style={{
                      width: '80px',
                      background: 'rgba(16, 18, 25, 0.9)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: `2px solid ${stageColor}`,
                      boxShadow: '4px 0 10px rgba(0,0,0,0.5)',
                      padding: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: stageColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        textAlign: 'center',
                      }}
                    >
                      {stage}
                    </span>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {stage === 'Main' ? 'Escenario 1' : stage === 'Ritual' ? 'Escenario 2' : stage === 'Chaos' ? 'Escenario 3' : 'Escenario 4'}
                    </span>
                  </div>

                  {/* Lane content container */}
                  <div
                    style={{
                      position: 'relative',
                      width: `${TIMELINE_WIDTH}px`,
                      height: '100%',
                    }}
                  >
                    {stageActs.map((act) => {
                      const isFavorite = favorites.includes(act.id);
                      const leftPos = act.startMinutes * MINUTE_WIDTH;
                      const blockWidth = act.duration * MINUTE_WIDTH;
                      const hasConflict = isFavorite && conflictActIds.has(act.id);
                      const isPlayingNow = shouldShowLive && currentTimeMinutes >= act.startMinutes && currentTimeMinutes < act.endMinutes;
                      const minToStart = act.startMinutes - currentTimeMinutes;
                      const showCountdown = isFavorite && shouldShowLive && minToStart > 0 && minToStart <= 120;

                      const glassStyle = getStageGlassStyle(act.stage, isPlayingNow, isFavorite);

                      return (
                        <div
                          key={act.id}
                          onClick={() => onSelectAct(act)}
                          style={{
                            position: 'absolute',
                            left: `${leftPos + 4}px`, // small offset spacing
                            width: `${blockWidth - 8}px`, // small offset spacing
                            top: '12px',
                            height: '70px',
                            color: '#ffffff', /* High-contrast white text */
                            borderRadius: '12px',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'transform 0.15s, filter 0.15s, box-shadow 0.15s',
                            zIndex: isPlayingNow ? 6 : (isFavorite ? 5 : 2),
                            overflow: 'hidden',
                            ...glassStyle,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                        >
                          {/* Card header: Band Name & Favorite Button */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                color: '#ffffff',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                whiteSpace: 'normal', /* Permitir salto de línea */
                                overflow: 'hidden',
                                lineHeight: 1.1,
                                flex: 1,
                                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                              }}
                            >
                              {act.band}
                            </span>
                            
                            <button
                              onClick={(e) => onToggleFavorite(act.id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isFavorite ? '#ffd600' : 'rgba(255, 255, 255, 0.8)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Zap
                                size={14}
                                fill={isFavorite ? '#ffd600' : 'none'}
                                stroke={isFavorite ? '#ffd600' : '#ffffff'}
                                strokeWidth={2.5}
                                style={{
                                  filter: isFavorite ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))' : 'none',
                                }}
                              />
                            </button>
                          </div>

                          {/* Card Footer: Set Times */}
                          <div
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: 'rgba(255, 255, 255, 0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>
                                {act.start} - {act.end}
                              </span>
                              {isPlayingNow && (
                                <span className="pulse-badge" style={{ fontSize: '0.55rem', padding: '1px 3px', transform: 'scale(0.85)', transformOrigin: 'left' }}>
                                  ● LIVE
                                </span>
                              )}
                              {showCountdown && (
                                <span style={{ color: '#ffd600', fontWeight: '800', fontSize: '0.62rem', background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: '3px' }}>
                                  {minToStart}'
                                </span>
                              )}
                              {hasConflict && (
                                <span style={{ color: '#ffd600', fontWeight: '800', fontSize: '0.75rem' }} title="Conflicto de horario (se solapa con otra favorita)">
                                  ⚠️
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                              {act.duration} min
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator reminder for mobile UX */}
      <div
        style={{
          background: 'rgba(13,15,20,0.8)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          padding: '6px 16px',
          textAlign: 'center',
          fontWeight: '600',
          letterSpacing: '0.5px',
        }}
      >
        ← Desliza horizontalmente para navegar por los horarios →
      </div>
    </div>
  );
};
