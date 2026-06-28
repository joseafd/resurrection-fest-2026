import React, { useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import type { Act } from '../data/festivalData';

interface StagesViewProps {
  acts: Act[];
  stages: string[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectAct: (act: Act) => void;
}

export const StagesView: React.FC<StagesViewProps> = ({
  acts,
  stages,
  favorites,
  onToggleFavorite,
  onSelectAct,
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
              background: '#0d0f14',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {/* Corner spacer for sticky stage header */}
            <div
              style={{
                width: '80px',
                background: '#0d0f14',
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
                      background: 'rgba(13, 15, 20, 0.95)',
                      backdropFilter: 'blur(8px)',
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
                      const stageColor = `var(--color-${stage.toLowerCase()})`;

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
                            background: stageColor, /* Solid Stage Color Background */
                            color: '#ffffff', /* High-contrast white text */
                            border: isFavorite
                              ? '2px solid #ffffff' /* White border for active favorites to pop */
                              : '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'transform 0.15s, filter 0.15s, box-shadow 0.15s',
                            boxShadow: isFavorite 
                              ? '0 0 12px rgba(255, 255, 255, 0.35)' 
                              : '0 4px 8px rgba(0,0,0,0.25)',
                            zIndex: isFavorite ? 5 : 2,
                            overflow: 'hidden',
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
                              fontSize: '0.75rem', /* Aumentado */
                              fontWeight: '700',
                              color: 'rgba(255, 255, 255, 0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            }}
                          >
                            <span>
                              {act.start} - {act.end}
                            </span>
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
