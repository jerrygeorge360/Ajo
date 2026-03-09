import { useCircleCount, useCircleState } from '../hooks/useAjo';

interface CircleBrowserProps {
  onSelectCircle: (circleId: number) => void;
}

export function CircleBrowser({ onSelectCircle }: CircleBrowserProps) {
  const { data: circleCount } = useCircleCount();
  const circles = Array.from({ length: Number(circleCount || 0) }).map((_, i) => i);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          0%   { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .cb-wrap {
          font-family: 'Syne', sans-serif;
          background: linear-gradient(160deg, #0f1218 0%, #0a0e14 60%, #0d1117 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          animation: floatUp 0.5s ease both;
        }
        .cb-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 0%, rgba(245,158,11,0.05) 0%, transparent 55%),
                      radial-gradient(ellipse at 20% 100%, rgba(14,165,233,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .cb-wrap::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #f59e0b, #0ea5e9, #7c6af7, #f59e0b);
          background-size: 300% 100%;
          animation: borderSpin 4s linear infinite;
          border-radius: 24px 24px 0 0;
        }

        .cb-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .cb-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(14,165,233,0.2));
          border: 1px solid rgba(245,158,11,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .cb-title {
          font-size: 1.45rem; font-weight: 800;
          color: #fff; letter-spacing: -0.02em;
          line-height: 1.1; margin: 0;
        }
        .cb-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .cb-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin-bottom: 24px;
        }

        .cb-count-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 20px;
          padding: 4px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          color: #f59e0b;
          letter-spacing: 0.08em;
          margin-bottom: 20px;
        }
        .cb-count-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f59e0b;
          animation: pulseGlow 2s ease infinite;
        }

        /* Empty state */
        .cb-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 24px; gap: 12px;
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 16px;
        }
        .cb-empty-icon {
          font-size: 2.5rem; opacity: 0.4;
        }
        .cb-empty-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* Grid */
        .cb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
        }

        /* Circle card */
        .cc-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 20px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: cardIn 0.4s ease both;
        }
        .cc-card:hover {
          border-color: rgba(245,158,11,0.35);
          background: rgba(245,158,11,0.04);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.3), 0 0 0 1px rgba(245,158,11,0.12);
        }
        .cc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cc-card:hover::before { opacity: 1; }

        /* Loading card */
        .cc-card-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 24px 0;
        }
        .cc-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .cc-loading-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.08em;
        }

        /* Card header */
        .cc-card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cc-card-id {
          font-size: 0.95rem; font-weight: 800;
          color: #fff; letter-spacing: -0.01em;
          margin: 0;
        }

        /* Status badges */
        .cc-badge {
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 20px;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .cc-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
        }
        .cc-badge.open {
          background: rgba(0,212,170,0.12);
          border: 1px solid rgba(0,212,170,0.25);
          color: #00d4aa;
        }
        .cc-badge.open .cc-badge-dot { background: #00d4aa; }
        .cc-badge.active {
          background: rgba(245,158,11,0.12);
          border: 1px solid rgba(245,158,11,0.25);
          color: #f59e0b;
        }
        .cc-badge.active .cc-badge-dot { background: #f59e0b; animation: pulseGlow 1.5s ease infinite; }
        .cc-badge.completed {
          background: rgba(124,106,247,0.12);
          border: 1px solid rgba(124,106,247,0.25);
          color: #7c6af7;
        }
        .cc-badge.completed .cc-badge-dot { background: #7c6af7; }

        /* Stats */
        .cc-stats {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 18px;
        }
        .cc-stat-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .cc-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 6px;
        }
        .cc-stat-value {
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          font-weight: 500;
          color: #fff;
          letter-spacing: 0.02em;
        }

        /* Member bar */
        .cc-member-bar-wrap {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          margin-top: 4px;
          overflow: hidden;
        }
        .cc-member-bar {
          height: 100%;
          background: linear-gradient(90deg, #00d4aa, #7c6af7);
          border-radius: 2px;
          transition: width 0.6s ease;
        }

        /* Actions */
        .cc-actions {
          display: flex; gap: 8px;
        }
        .cc-btn-copy {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 9px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          letter-spacing: 0.06em;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .cc-btn-copy:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.18);
        }
        .cc-btn-view {
          flex: 1;
          background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(14,165,233,0.15));
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 10px;
          padding: 9px 12px;
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          color: #f59e0b;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .cc-btn-view:hover {
          background: linear-gradient(135deg, rgba(245,158,11,0.25), rgba(14,165,233,0.2));
          box-shadow: 0 4px 14px rgba(245,158,11,0.2);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="cb-wrap">
        {/* Header */}
        <div className="cb-header">
          <div className="cb-icon">🔍</div>
          <div>
            <h2 className="cb-title">Browse Circles</h2>
            <p className="cb-subtitle">Discover savings rounds</p>
          </div>
        </div>

        <div className="cb-divider" />

        {!circleCount || Number(circleCount) === 0 ? (
          <div className="cb-empty">
            <div className="cb-empty-icon">🌀</div>
            <p className="cb-empty-text">No circles created yet.<br />Create the first one!</p>
          </div>
        ) : (
          <>
            <div className="cb-count-pill">
              <span className="cb-count-dot" />
              {Number(circleCount)} circle{Number(circleCount) !== 1 ? 's' : ''} active
            </div>
            <div className="cb-grid">
              {circles.map((circleId) => (
                <CircleCard key={circleId} circleId={circleId} onSelect={onSelectCircle} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CircleCard({ circleId, onSelect }: { circleId: number; onSelect: (id: number) => void }) {
  const { data: state } = useCircleState(circleId);

  if (!state) {
    return (
      <div className="cc-card">
        <div className="cc-card-loading">
          <div className="cc-spinner" />
          <span className="cc-loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  const statusIndex = Number(state.status);
  const statusLabels = ['Open', 'Active', 'Completed'];
  const statusClasses = ['open', 'active', 'completed'];
  const statusEmojis = ['🔓', '🔄', '✅'];
  const statusLabel = statusLabels[statusIndex] ?? 'Unknown';
  const statusClass = statusClasses[statusIndex] ?? '';
  const statusEmoji = statusEmojis[statusIndex] ?? '❓';

  const memberCount = state.members.length;
  const maxMembers = Number(state.maxMembers);
  const memberPct = maxMembers > 0 ? (memberCount / maxMembers) * 100 : 0;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(circleId.toString());
    alert(`Circle ID ${circleId} copied to clipboard!`);
  };

  return (
    <div className="cc-card" onClick={() => onSelect(circleId)}>
   
      <div className="cc-card-header">
        <h3 className="cc-card-id">Circle #{circleId}</h3>
        <span className={`cc-badge ${statusClass}`}>
          <span className="cc-badge-dot" />
          {statusEmoji} {statusLabel}
        </span>
      </div>

      <div className="cc-stats">
        <div className="cc-stat-row">
          <span className="cc-stat-label">💰 Per Round</span>
          <span className="cc-stat-value">{(Number(state.contributionAmount) / 1e18).toFixed(4)} FLOW</span>
        </div>
        <div className="cc-stat-row">
          <span className="cc-stat-label">⏱ Duration</span>
          <span className="cc-stat-value">{Math.round(Number(state.roundDuration) / 60)} min</span>
        </div>
        <div className="cc-stat-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="cc-stat-label">👥 Members</span>
            <span className="cc-stat-value">{memberCount} / {maxMembers}</span>
          </div>
          <div className="cc-member-bar-wrap">
            <div className="cc-member-bar" style={{ width: `${memberPct}%` }} />
          </div>
        </div>
      </div>

      <div className="cc-actions">
        <button className="cc-btn-copy" onClick={handleCopyId}>
          📋 Copy ID
        </button>
        <button className="cc-btn-view" onClick={(e) => { e.stopPropagation(); onSelect(circleId); }}>
          👁 View
        </button>
      </div>
    </div>
  );
}