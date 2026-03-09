import { useEffect, useState } from 'react';
import { useCircleState, useHasContributed, useJoinCircle } from '../hooks/useAjo';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { ContributeButton } from './ContributeButton';

interface Props {
  circleId: number;
}

export function CircleDashboard({ circleId }: Props) {
  const { address } = useAccount();
  const { data: state, isLoading, refetch } = useCircleState(circleId);
  const { data: hasContributed } = useHasContributed(circleId, address);
  const { joinCircle, isPending: isJoining, isSuccess: joinSuccess } = useJoinCircle();
  const [nowTs, setNowTs] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (joinSuccess) refetch();
  }, [joinSuccess, refetch]);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => refetch(), 4000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return (
    <div className="card">
      <style>{cdStyles}</style>
      <div className="cd-loading">
        <div className="cd-spinner" />
        <span className="cd-loading-text">Loading circle data...</span>
      </div>
    </div>
  );

  if (!state) return (
    <div className="card">
      <style>{cdStyles}</style>
      <div className="cd-loading">
        <span className="cd-loading-text">Circle not found</span>
      </div>
    </div>
  );

  const statusIndex = Number(state.status);
  const statusLabels  = ['Open', 'Active', 'Completed'];
  const statusClasses = ['status-open', 'status-active', 'status-completed'];
  const statusEmojis  = ['🔓', '🔄', '✅'];

  const isMember = state.members.some((m) => m.toLowerCase() === address?.toLowerCase());
  const isCurrentRecipient = state.nextRecipient?.toLowerCase() === address?.toLowerCase();
  const requiredContributors = Math.max(0, state.members.length - 1);
  const roundEndTime = Number(state.roundStartTime) + Number(state.roundDuration);
  const timeRemaining = Math.max(0, roundEndTime - nowTs);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;
  const contributionPct = requiredContributors === 0
    ? 0
    : Math.min(100, (Number(state.contributorsThisRound) / requiredContributors) * 100);
  const memberPct = Number(state.maxMembers) > 0
    ? (state.members.length / Number(state.maxMembers)) * 100
    : 0;

  return (
    <>
      <style>{cdStyles}</style>
      <div className="card cd-wrap">

        
        <div className="cd-header">
          <div className="cd-header-left">
            <div className="cd-icon">📊</div>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Circle #{circleId}</h2>
              <p className="cd-subtitle">Savings Round Dashboard</p>
            </div>
          </div>
          <span className={`status-badge ${statusClasses[statusIndex]}`}>
            <span className="cd-status-dot" />
            {statusEmojis[statusIndex]} {statusLabels[statusIndex]}
          </span>
        </div>

       
        <div className="cd-stats-row">
          <div className="cd-stat-card">
            <span className="cd-stat-value">{formatEther(state.contributionAmount)}</span>
            <span className="cd-stat-label">💰 FLOW per round</span>
          </div>
          <div className="cd-stat-card">
            <span className="cd-stat-value">{state.members.length} <span className="cd-stat-dim">/ {Number(state.maxMembers)}</span></span>
            <span className="cd-stat-label">👥 Members</span>
            <div className="cd-mini-bar-wrap">
              <div className="cd-mini-bar cd-mini-bar-teal" style={{ width: `${memberPct}%` }} />
            </div>
          </div>
        </div>

       
        {statusIndex === 1 && (
          <>
           
            <div className="cd-panel">
              <div className="cd-panel-grid">

               
                <div className="cd-panel-item">
                  <span className="cd-panel-label">Round Progress</span>
                  <span className="cd-panel-value">
                    {Number(state.currentRound) + 1}
                    <span className="cd-panel-dim"> / {state.members.length}</span>
                  </span>
                </div>

              
                <div className="cd-panel-item">
                  <span className="cd-panel-label">Next Recipient</span>
                  <span className="cd-panel-value cd-mono cd-panel-addr">
                    {state.nextRecipient?.slice(0, 10)}…{state.nextRecipient?.slice(-8)}
                  </span>
                </div>

              
                <div className="cd-panel-item">
                  <span className="cd-panel-label">Time Remaining</span>
                  <span className="cd-panel-value cd-timer">
                    ⏱ {minutesRemaining}m {String(secondsRemaining).padStart(2, '0')}s
                  </span>
                </div>

               
                <div className="cd-panel-item cd-panel-item-full">
                  <div className="cd-contrib-header">
                    <span className="cd-panel-label">Contributions This Round</span>
                    <span className="cd-panel-value">
                      {Number(state.contributorsThisRound)}
                      <span className="cd-panel-dim"> / {requiredContributors}</span>
                    </span>
                  </div>
                  <div className="cd-bar-wrap">
                    <div className="cd-bar cd-bar-amber" style={{ width: `${contributionPct}%` }} />
                  </div>
                  <span className="cd-bar-pct">{Math.round(contributionPct)}% contributed</span>
                </div>

              </div>
            </div>

          
            <div className="cd-members-section">
              <h3 className="cd-members-title">👥 Members</h3>
              <div className="cd-members-list">
                {state.members.map((member, idx) => {
                  const isRecipient = idx === Number(state.currentRound);
                  const isYou = member.toLowerCase() === address?.toLowerCase();
                  return (
                    <div key={member} className={`cd-member-row${isRecipient ? ' cd-member-row-active' : ''}`}>
                      <div className="cd-member-left">
                        <div className={`cd-member-avatar${isRecipient ? ' cd-member-avatar-active' : ''}`}>
                          {idx + 1}
                        </div>
                        <span className="cd-member-addr cd-mono">
                          {member.slice(0, 8)}…{member.slice(-6)}
                          {isYou && <span className="cd-you-tag">you</span>}
                        </span>
                      </div>
                      {isRecipient && (
                        <span className="cd-receiving-badge">🎯 Receiving</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action area */}
            {isMember && !isCurrentRecipient && (
              <ContributeButton
                circleId={circleId}
                contributionAmount={formatEther(state.contributionAmount)}
                hasContributed={hasContributed || false}
                onSuccess={() => refetch()}
              />
            )}
            {isMember && isCurrentRecipient && (
              <div className="cd-info-banner cd-info-banner-amber">
                🎯 You are this round's recipient — no contribution needed.
              </div>
            )}
          </>
        )}

        {statusIndex === 0 && (
          <div className="cd-waiting">
            <div className="cd-waiting-icon">⏳</div>
            <p className="cd-waiting-text">Waiting for members to join…</p>
            <p className="cd-waiting-sub">
              {Number(state.maxMembers) - state.members.length} spot{Number(state.maxMembers) - state.members.length !== 1 ? 's' : ''} remaining
            </p>
            {!isMember && (
              <button
                onClick={() => joinCircle(circleId)}
                disabled={isJoining}
                className="btn btn-primary btn-large cd-join-btn"
              >
                {isJoining
                  ? <><span className="cd-btn-spinner" /> Joining...</>
                  : '➕ Join Circle'
                }
              </button>
            )}
            {isMember && (
              <div className="cd-info-banner cd-info-banner-teal">
                ✅ You're in! Waiting for {Number(state.maxMembers) - state.members.length} more member(s).
              </div>
            )}
          </div>
        )}

        {statusIndex === 2 && (
          <div className="cd-completed">
            <div className="cd-completed-icon">🎉</div>
            <p className="cd-completed-title">Circle Completed!</p>
            <p className="cd-completed-sub">All members have received their payout.</p>
            <div className="cd-completed-confetti">
              {['💰','✨','🏆','💎','🌟'].map((e, i) => (
                <span key={i} className="cd-confetti-piece" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

const cdStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  @keyframes cd-spin    { to { transform: rotate(360deg); } }
  @keyframes cd-pulse   { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
  @keyframes cd-floatUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cd-barGrow { from { width: 0%; } to { width: var(--target-w); } }
  @keyframes cd-confetti { 0% { opacity:0; transform:translateY(8px) scale(0.7); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes cd-timerPulse { 0%,100% { color:#fff; } 50% { color:#f59e0b; } }

  /* Wrap */
  .cd-wrap { font-family: 'Syne', sans-serif; animation: cd-floatUp 0.4s ease both; }

  /* Loading */
  .cd-loading {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; padding: 48px 0;
  }
  .cd-spinner {
    width: 20px; height: 20px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #0ea5e9;
    border-radius: 50%;
    animation: cd-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  .cd-loading-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem; color: rgba(255,255,255,0.3);
    letter-spacing: 0.08em;
  }

  /* Header */
  .cd-header {
    display: flex; align-items: center;
    justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .cd-header-left { display: flex; align-items: center; gap: 14px; }
  .cd-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(245,158,11,0.2));
    border: 1px solid rgba(16,185,129,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; flex-shrink: 0; backdrop-filter: blur(8px);
  }
  .cd-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem; color: rgba(255,255,255,0.3);
    letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px;
  }
  .cd-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor; display: inline-block;
    animation: cd-pulse 2s ease infinite;
  }

  /* Stats row */
  .cd-stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px; margin-bottom: 24px;
  }
  .cd-stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 4px;
    transition: border-color 0.2s, background 0.2s;
  }
  .cd-stat-card:hover {
    border-color: rgba(14,165,233,0.3);
    background: rgba(14,165,233,0.04);
  }
  .cd-stat-value {
    font-size: 1.7rem; font-weight: 800;
    color: #fff; letter-spacing: -0.02em; line-height: 1.1;
  }
  .cd-stat-dim { font-size: 1.1rem; font-weight: 600; color: rgba(255,255,255,0.3); }
  .cd-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem; color: rgba(255,255,255,0.35);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .cd-mini-bar-wrap {
    height: 3px; background: rgba(255,255,255,0.07);
    border-radius: 2px; margin-top: 10px; overflow: hidden;
  }
  .cd-mini-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .cd-mini-bar-teal { background: linear-gradient(90deg, #10b981, #0ea5e9); }

  /* Round info panel */
  .cd-panel {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 20px;
    margin-bottom: 20px;
  }
  .cd-panel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }
  .cd-panel-item {
    display: flex; flex-direction: column; gap: 6px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
  }
  .cd-panel-item-full { grid-column: 1 / -1; }
  .cd-panel-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem; color: rgba(255,255,255,0.3);
    letter-spacing: 0.1em; text-transform: uppercase;
  }
  .cd-panel-value {
    font-size: 1.2rem; font-weight: 700; color: #fff; letter-spacing: -0.01em;
  }
  .cd-panel-dim { font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.3); }
  .cd-panel-addr { font-size: 0.82rem !important; letter-spacing: 0 !important; }
  .cd-mono { font-family: 'DM Mono', monospace !important; }
  .cd-timer { animation: cd-timerPulse 2s ease infinite; }

  /* Contribution bar */
  .cd-contrib-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 10px;
  }
  .cd-bar-wrap {
    height: 6px; background: rgba(255,255,255,0.07);
    border-radius: 4px; overflow: hidden;
  }
  .cd-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .cd-bar-amber { background: linear-gradient(90deg, #f59e0b, #ef4444); }
  .cd-bar-pct {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem; color: rgba(255,255,255,0.25);
    letter-spacing: 0.08em; margin-top: 6px; display: block;
  }

  /* Members */
  .cd-members-section { margin-bottom: 20px; }
  .cd-members-title {
    font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.85);
    margin-bottom: 12px; letter-spacing: -0.01em;
  }
  .cd-members-list { display: flex; flex-direction: column; gap: 8px; }
  .cd-member-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    transition: border-color 0.2s, background 0.2s;
  }
  .cd-member-row-active {
    background: rgba(245,158,11,0.06);
    border-color: rgba(245,158,11,0.2);
  }
  .cd-member-left { display: flex; align-items: center; gap: 10px; }
  .cd-member-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem; font-weight: 500; color: rgba(255,255,255,0.5);
    flex-shrink: 0;
  }
  .cd-member-avatar-active {
    background: rgba(245,158,11,0.15);
    border-color: rgba(245,158,11,0.35);
    color: #f59e0b;
  }
  .cd-member-addr {
    font-size: 0.8rem; color: rgba(255,255,255,0.6);
    display: flex; align-items: center; gap: 6px;
  }
  .cd-you-tag {
    font-size: 0.58rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 1px 6px; border-radius: 20px;
    background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3);
    color: #0ea5e9;
  }
  .cd-receiving-badge {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem; font-weight: 500; letter-spacing: 0.06em;
    padding: 4px 10px; border-radius: 20px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.25);
    color: #f59e0b;
  }

  /* Info banners */
  .cd-info-banner {
    padding: 14px 18px; border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.03em;
    margin-top: 8px;
  }
  .cd-info-banner-teal {
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    color: #10b981;
  }
  .cd-info-banner-amber {
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    color: #f59e0b;
  }

  /* Waiting state */
  .cd-waiting {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; gap: 10px;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 18px;
  }
  .cd-waiting-icon { font-size: 2.8rem; animation: cd-pulse 2s ease infinite; }
  .cd-waiting-text {
    font-size: 1.05rem; font-weight: 700;
    color: rgba(255,255,255,0.7); letter-spacing: -0.01em; margin: 0;
  }
  .cd-waiting-sub {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem; color: rgba(255,255,255,0.3);
    letter-spacing: 0.08em; margin: 0 0 12px;
  }
  .cd-join-btn {
    background: linear-gradient(135deg, #10b981, #0ea5e9) !important;
    border: none !important; border-radius: 14px !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important; letter-spacing: 0.01em !important;
    box-shadow: 0 4px 20px rgba(16,185,129,0.25) !important;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform 0.15s, box-shadow 0.2s !important;
  }
  .cd-join-btn:hover:not(:disabled) {
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 28px rgba(16,185,129,0.35) !important;
  }
  .cd-btn-spinner {
    width: 14px; height: 14px; display: inline-block;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: cd-spin 0.7s linear infinite;
  }

  /* Completed state */
  .cd-completed {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 24px; gap: 10px; text-align: center;
  }
  .cd-completed-icon { font-size: 4rem; margin-bottom: 4px; }
  .cd-completed-title {
    font-size: 1.5rem; font-weight: 800;
    color: #fff; letter-spacing: -0.02em; margin: 0;
  }
  .cd-completed-sub {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem; color: rgba(255,255,255,0.35);
    letter-spacing: 0.06em; margin: 0;
  }
  .cd-completed-confetti {
    display: flex; gap: 12px; margin-top: 16px;
  }
  .cd-confetti-piece {
    font-size: 1.4rem;
    animation: cd-confetti 0.5s ease both;
  }
`;