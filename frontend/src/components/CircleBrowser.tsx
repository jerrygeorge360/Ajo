import { useCircleCount, useCircleState } from '../hooks/useAjo';
import './CircleBrowser.css';

interface CircleBrowserProps {
  onSelectCircle: (circleId: number) => void;
}

export function CircleBrowser({ onSelectCircle }: CircleBrowserProps) {
  const { data: circleCount } = useCircleCount();

  const circles = Array.from({ length: Number(circleCount || 0) }).map((_, i) => i);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #f59e0b, #0ea5e9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          🔍
        </div>
        <h2 className="card-title" style={{ margin: 0 }}>Browse Circles</h2>
      </div>
      {!circleCount || Number(circleCount) === 0 ? (
        <p className="empty-state">No circles created yet. Create the first one!</p>
      ) : (
        <div className="circles-grid">
          {circles.map((circleId) => (
            <CircleCard key={circleId} circleId={circleId} onSelect={onSelectCircle} />
          ))}
        </div>
      )}
    </div>
  );
}

function CircleCard({ circleId, onSelect }: { circleId: number; onSelect: (id: number) => void }) {
  const { data: state } = useCircleState(circleId);

  if (!state) {
    return (
      <div className="circle-card card">
        <div className="circle-card-loading">Loading...</div>
      </div>
    );
  }

  const statusText = ['🔓 Open', '🔄 Active', '✅ Completed'][Number(state.status)] || 'Unknown';
  const statusClass = ['status-open', 'status-active', 'status-completed'][Number(state.status)] || '';

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(circleId.toString());
    alert(`Circle ID ${circleId} copied to clipboard!`);
  };

  return (
    <div className="circle-card card" onClick={() => onSelect(circleId)}>
      <div className="circle-card-header">
        <h3 className="circle-card-id">Circle #{circleId}</h3>
        <span className={`status-badge ${statusClass}`}>{statusText}</span>
      </div>

      <div className="circle-card-details">
        <div className="detail-row">
          <span className="detail-label">💰 Per Round:</span>
          <span className="detail-value">{(Number(state.contributionAmount) / 1e18).toFixed(4)} FLOW</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">👥 Members:</span>
          <span className="detail-value">
            {state.members.length} / {Number(state.maxMembers)}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">⏱️ Round:</span>
          <span className="detail-value">{Math.round(Number(state.roundDuration) / 60)}min</span>
        </div>
      </div>

      <div className="circle-card-actions">
        <button className="btn btn-small btn-primary" onClick={handleCopyId}>
          📋 Copy ID
        </button>
        <button className="btn btn-small btn-success" onClick={() => onSelect(circleId)}>
          👁️ View
        </button>
      </div>
    </div>
  );
}
