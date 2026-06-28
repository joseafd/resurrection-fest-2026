import React from 'react';
import { X, Zap, Clock, Calendar, MapPin } from 'lucide-react';
import type { Act } from '../data/festivalData';

interface BandDetailModalProps {
  act: Act | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const BandDetailModal: React.FC<BandDetailModalProps> = ({
  act,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!isOpen || !act) return null;

  const stageColor = `var(--color-${act.stage.toLowerCase()})`;

  // Generate initials for the image placeholder (e.g. "Iron Maiden" -> "IM")
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Helper to format Spanish weekday name
  const getDayDescription = (id: string): string => {
    if (id.startsWith('2026-07-01')) return 'Miércoles 1 de Julio';
    if (id.startsWith('2026-07-02')) return 'Jueves 2 de Julio';
    if (id.startsWith('2026-07-03')) return 'Viernes 3 de Julio';
    if (id.startsWith('2026-07-04')) return 'Sábado 4 de Julio';
    return '';
  };

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
          maxWidth: '400px',
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
        
        {/* 1. HERO PLACEHOLDER HEADER */}
        <div
          style={{
            height: '180px',
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
            }}
          />

          {/* Giant initials placeholder */}
          <span
            style={{
              fontSize: '5rem',
              fontWeight: '900',
              color: 'rgba(255, 255, 255, 0.03)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '10px',
              userSelect: 'none',
              transform: 'scale(1.2)',
            }}
          >
            {getInitials(act.band)}
          </span>

          {/* Close button inside hero */}
          <button
            onClick={onClose}
            aria-label="Cerrar detalles"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <X size={16} />
          </button>

          {/* Band Name overlaid at bottom of hero */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '20px',
              right: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              {act.band}
            </h2>
          </div>
        </div>

        {/* 2. MODAL BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Gig details row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: 'rgba(255,255,255,0.02)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Calendar size={14} color="var(--accent-red)" />
              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Día</div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{getDayDescription(act.id)}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Clock size={14} color="var(--accent-red)" />
              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Horario</div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{act.start} - {act.end} <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({act.duration}m)</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', gridColumn: 'span 2', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '8px' }}>
              <MapPin size={14} color={stageColor} />
              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Escenario</div>
                <div style={{ fontWeight: '700', color: stageColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{act.stage} Stage</div>
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
              padding: '12px',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isFavorite ? 'none' : '0 4px 15px rgba(255, 0, 60, 0.3)',
              transition: 'background 0.2s, border-color 0.2s, transform 0.1s',
            }}
            className="btn-interactive"
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Zap size={16} fill={isFavorite ? 'var(--accent-red)' : 'none'} />
            {isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
          </button>

          {/* Description Section */}
          <div>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Información de la Banda
            </h3>

            {act.bio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {act.bio.title && (
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-red)', borderLeft: '2px solid var(--accent-red)', paddingLeft: '8px', lineHeight: 1.3 }}>
                    {act.bio.title}
                  </h4>
                )}
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {act.bio.description}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Información no disponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
