import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Current values
  onlyFavorites: boolean;
  visibleStages: string[];
  stagesOrder: string[];
  // Save callbacks
  onSave: (onlyFavorites: boolean, visibleStages: string[], stagesOrder: string[]) => void;
  defaultStages: string[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onlyFavorites: propOnlyFavorites,
  visibleStages: propVisibleStages,
  stagesOrder: propStagesOrder,
  onSave,
  defaultStages,
}) => {
  // Local state to manage changes before committing on "Guardar"
  const [localOnlyFavorites, setLocalOnlyFavorites] = useState(propOnlyFavorites);
  const [localVisibleStages, setLocalVisibleStages] = useState<string[]>([]);
  const [localStagesOrder, setLocalStagesOrder] = useState<string[]>([]);

  // Synchronize local state with props when drawer opens
  useEffect(() => {
    if (isOpen) {
      setLocalOnlyFavorites(propOnlyFavorites);
      setLocalVisibleStages([...propVisibleStages]);
      setLocalStagesOrder([...propStagesOrder]);
    }
  }, [isOpen, propOnlyFavorites, propVisibleStages, propStagesOrder]);

  if (!isOpen) return null;

  // Toggle stage visibility
  const handleToggleStageVisibility = (stage: string) => {
    setLocalVisibleStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  // Move stage up in the order
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...localStagesOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setLocalStagesOrder(newOrder);
  };

  // Move stage down in the order
  const handleMoveDown = (index: number) => {
    if (index === localStagesOrder.length - 1) return;
    const newOrder = [...localStagesOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setLocalStagesOrder(newOrder);
  };

  // Reset to default settings
  const handleReset = () => {
    setLocalOnlyFavorites(false);
    setLocalVisibleStages([...defaultStages]);
    setLocalStagesOrder([...defaultStages]);
  };

  // Commit changes and close
  const handleSave = () => {
    // Prevent saving if no stages are visible
    if (localVisibleStages.length === 0) {
      alert("Debes tener al menos un escenario visible.");
      return;
    }
    onSave(localOnlyFavorites, localVisibleStages, localStagesOrder);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out forwards',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* Drawer Panel */}
      <div
        style={{
          width: '85%',
          maxWidth: '380px',
          height: '100%',
          background: '#0d0f14',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when tapping panel
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px' }}>FILTROS Y ESCENARIOS</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar panel de filtros"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Favorites Filter Section */}
          <div>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
              Preferencias
            </h3>
            
            <div className="switch-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={16} color="var(--accent-red)" fill="var(--accent-red)" />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Sólo mostrar favoritos</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localOnlyFavorites}
                  onChange={(e) => setLocalOnlyFavorites(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Stages Configuration Section (Visibility & Reordering) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Visibilidad y Orden de Escenarios
              </h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Usa las flechas para ordenar
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {localStagesOrder.map((stage, idx) => {
                const isVisible = localVisibleStages.includes(stage);
                const stageColor = `var(--color-${stage.toLowerCase()})`;

                return (
                  <div
                    key={stage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: isVisible ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                      border: `1px solid ${isVisible ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'}`,
                      borderRadius: '12px',
                      opacity: isVisible ? 1 : 0.6,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {/* Checkbox / Eye toggle */}
                    <button
                      onClick={() => handleToggleStageVisibility(stage)}
                      aria-label={isVisible ? `Ocultar escenario ${stage}` : `Mostrar escenario ${stage}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isVisible ? stageColor : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                      }}
                    >
                      {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    {/* Stage Name */}
                    <span
                      style={{
                        flex: 1,
                        marginLeft: '12px',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: isVisible ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {stage}
                    </span>

                    {/* Reordering Controls */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        aria-label={`Mover ${stage} hacia arriba`}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: 'none',
                          color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: idx === 0 ? 0.3 : 1,
                        }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === localStagesOrder.length - 1}
                        aria-label={`Mover ${stage} hacia abajo`}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: 'none',
                          color: idx === localStagesOrder.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: idx === localStagesOrder.length - 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: idx === localStagesOrder.length - 1 ? 0.3 : 1,
                        }}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            background: '#0a0b0d',
          }}
        >
          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
          >
            <RefreshCw size={14} />
            Restablecer
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              background: 'var(--accent-red)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 0, 60, 0.3)',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            className="btn-interactive"
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
