import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Calendar, MapPin } from 'lucide-react';
import type { Act } from '../data/festivalData';

import { festivalData } from '../data/festivalData';

interface BandDetailModalProps {
  act: Act | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  conflictActIds?: Set<string>;
  favorites?: string[];
}

export const BandDetailModal: React.FC<BandDetailModalProps> = ({
  act,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  conflictActIds = new Set(),
  favorites = [],
}) => {
  const [imgError, setImgError] = useState<boolean>(false);

  // Reset image error status when another act is clicked
  useEffect(() => {
    setImgError(false);
  }, [act]);

  // Find other favorited acts that overlap with this one
  const conflictingActs = React.useMemo(() => {
    if (!act || !isFavorite || !conflictActIds || !favorites) return [];
    
    const dayId = act.id.substring(0, 10);
    const day = festivalData.days.find(d => d.id === dayId);
    if (!day) return [];

    return day.acts.filter(a => {
      if (a.id === act.id) return false;
      if (!favorites.includes(a.id)) return false;
      
      const startOverlap = Math.max(act.startMinutes, a.startMinutes);
      const endOverlap = Math.min(act.endMinutes, a.endMinutes);
      return startOverlap < endOverlap;
    });
  }, [act, isFavorite, conflictActIds, favorites]);

  if (!isOpen || !act) return null;

  const stageColor = `var(--color-${act.stage.toLowerCase()})`;

  // Convert "Iron Maiden" to "IM" for the fallback gradient placeholder
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Convert band name to standardized uppercase filename (e.g. "P.O.D." -> "POD.jpg", "A Day To Remember" -> "A DAY TO REMEMBER.jpg")
  const getBandImageName = (name: string): string => {
    return name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accent diacritics
      .replace(/[^A-Z0-9\s-]/g, "") // remove dots/special characters
      .trim()
      .replace(/[\s-]+/g, " "); // preserve spaces and clean multiple spacing
  };

  // Helper to format Spanish weekday name
  const getDayDescription = (id: string): string => {
    if (id.startsWith('2026-07-01')) return 'Miércoles 1 de Julio';
    if (id.startsWith('2026-07-02')) return 'Jueves 2 de Julio';
    if (id.startsWith('2026-07-03')) return 'Viernes 3 de Julio';
    if (id.startsWith('2026-07-04')) return 'Sábado 4 de Julio';
    return '';
  };

  const imageName = getBandImageName(act.band);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '85vh',
          background: '#0d0f14',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent close on tap inside card
      >
        
        {/* 1. HERO PLACEHOLDER/IMAGE HEADER */}
        <div
          style={{
            height: '190px',
            position: 'relative',
            background: `linear-gradient(135deg, #18090d 0%, #08090e 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle metal grid text overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              background: 'radial-gradient(circle, transparent 20%, #000 20%, #000 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #000 20%, #000 80%, transparent 80%, transparent) 25px 25px',
              backgroundSize: '50px 50px',
              zIndex: 1,
            }}
          />

          {/* Fallback Giant initials placeholder (rendered in background) */}
          <span
            style={{
              fontSize: '5.5rem',
              fontWeight: '900',
              color: 'rgba(255, 255, 255, 0.03)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '10px',
              userSelect: 'none',
              transform: 'scale(1.2)',
              zIndex: 1,
            }}
          >
            {getInitials(act.band)}
          </span>

          {/* Dynamic Band Image (Loads if no error) */}
          {!imgError && (
            <img
              src={`./images/${imageName}.jpg`}
              alt={act.band}
              onError={() => setImgError(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 2,
                transition: 'opacity 0.3s ease',
              }}
            />
          )}

          {/* Dark gradient overlay on bottom of image for label legibility */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '90px',
              background: 'linear-gradient(to top, rgba(13, 15, 20, 1) 0%, rgba(13, 15, 20, 0) 100%)',
              zIndex: 3,
            }}
          />

          {/* Close button inside hero */}
          <button
            onClick={onClose}
            aria-label="Cerrar detalles"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'background-color 0.2s',
            }}
            className="btn-interactive"
          >
            <X size={18} />
          </button>

          {/* Band Name overlaid at bottom of hero */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              right: '20px',
              zIndex: 4,
            }}
          >
            <h2
              style={{
                fontSize: '1.65rem', /* Aumentado 2pt */
                fontWeight: '800',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.95)',
              }}
            >
              {act.band}
            </h2>
          </div>
        </div>

        {/* 2. MODAL BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Gig details row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              background: 'rgba(255,255,255,0.02)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.90rem', color: 'var(--text-secondary)' }}>
              <Calendar size={16} color="var(--accent-red)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Día</div>
                <div style={{ fontWeight: '800', color: '#fff' }}>{getDayDescription(act.id)}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.90rem', color: 'var(--text-secondary)' }}>
              <Clock size={16} color="var(--accent-red)" />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Horario</div>
                <div style={{ fontWeight: '800', color: '#fff' }}>
                  {act.start} - {act.end} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({act.duration}m)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.90rem', color: 'var(--text-secondary)', gridColumn: 'span 2', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '10px' }}>
              <MapPin size={16} color={stageColor} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Escenario</div>
                <div style={{ fontWeight: '800', color: stageColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {act.stage} Stage
                </div>
              </div>
            </div>
          </div>

          {/* Favorite CTA Button */}
          <button
            onClick={() => onToggleFavorite(act.id)}
            style={{
              width: '100%',
              background: isFavorite ? 'rgba(255, 0, 60, 0.1)' : 'var(--accent-red)',
              color: '#ffffff',
              border: isFavorite ? '2px solid var(--accent-red)' : 'none',
              borderRadius: '14px',
              padding: '14px', /* Aumentado padding */
              fontSize: '1.05rem', /* Aumentado 2pt */
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: isFavorite ? 'none' : '0 4px 15px rgba(255, 0, 60, 0.3)',
              transition: 'background 0.2s, border-color 0.2s, transform 0.1s',
            }}
            className="btn-interactive"
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Zap size={18} fill={isFavorite ? '#ffd600' : 'none'} stroke={isFavorite ? '#ffd600' : '#ffffff'} />
            {isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
          </button>

          {/* Timing Conflict Alert */}
          {isFavorite && conflictingActs.length > 0 && (
            <div
              className="glass"
              style={{
                background: 'rgba(255, 214, 0, 0.08)',
                border: '1px solid #ffd600',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginTop: '4px',
                boxShadow: '0 4px 15px rgba(255, 214, 0, 0.1)',
                animation: 'pulseYellow 2.5s infinite ease-in-out',
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>⚠️</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <span style={{ color: '#ffd600', fontWeight: '900', fontSize: '0.82rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Conflicto de Horario
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                  Coincide en tiempo con tu favorita:{' '}
                  {conflictingActs.map((c, idx) => (
                    <span key={c.id}>
                      <strong>{c.band}</strong> ({c.start} - {c.end} en {c.stage} Stage)
                      {idx < conflictingActs.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Información de la Banda
            </h3>

            {act.bio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {act.bio.title && (
                  <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--accent-red)', borderLeft: '3px solid var(--accent-red)', paddingLeft: '10px', lineHeight: 1.3 }}>
                    {act.bio.title}
                  </h4>
                )}
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {act.bio.description}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Información no disponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
