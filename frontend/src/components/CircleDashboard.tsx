import { useEffect, useState } from 'react';
import { useCircleState, useHasContributed, useJoinCircle } from '../hooks/useAjo';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { ContributeButton } from './ContributeButton';
import { useTriggerPayout, useResolveLateRound } from '../hooks/useAjo';

interface Props {
  circleId: number;
}

export function CircleDashboard({ circleId }: Props) {
  const { address } = useAccount();
  const { data: state, isLoading, refetch } = useCircleState(circleId);
  const { data: hasContributed } = useHasContributed(circleId, address);
  const { joinCircle, isPending: isJoining, isSuccess: joinSuccess } = useJoinCircle();
  const { triggerPayout, isPending: isTriggering } = useTriggerPayout();
  const { resolveLateRound, isPending: isResolving } = useResolveLateRound();
  
  const [copied, setCopied] = useState(false);
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

  const isMember = state.members.some((m: string) => m.toLowerCase() === address?.toLowerCase());
  const isCurrentRecipient = state.nextRecipient?.toLowerCase() === address?.toLowerCase();
  const requiredContributors = Math.max(0, state.members.length - 1);
  const roundEndTime = Number(state.roundStartTime) + Number(state.roundDuration);
  const graceEndTime = roundEndTime + (15 * 60); // 15 mins grace
  const isLate = nowTs > roundEndTime;
  const isGraceExceeded = nowTs > graceEndTime;

  const timeRemaining = Math.max(0, roundEndTime - nowTs);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  const graceRemaining = Math.max(0, graceEndTime - nowTs);
  const graceMinutes = Math.floor(graceRemaining / 60);
  const graceSeconds = graceRemaining % 60;
  const contributionPct = requiredContributors === 0
    ? 0
    : Math.min(100, (Number(state.contributorsThisRound) / requiredContributors) * 100);
  const memberPct = Number(state.maxMembers) > 0
    ? (state.members.length / Number(state.maxMembers)) * 100
    : 0;

  const handleInvite = () => {
    const text = `Join my Ajo savings circle! 🎪\nCircle ID: #${circleId}\nContribution: ${formatEther(state.contributionAmount)} FLOW\n\nLink: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <style>{cdStyles}</style>
      <div className="card cd-wrap">

        
        <header className="cd-header">
          <div className="cd-header-left">
            <div className="cd-icon">📊</div>
            <div>
              <h2 className="card-title" style={{ margin: 0 }}>Circle #{circleId}</h2>
              <p className="cd-subtitle">Savings Round Dashboard</p>
            </div>
          </div>
          <div className="cd-header-right">
            <button className={`cd-invite-btn ${copied ? 'copied' : ''}`} onClick={handleInvite}>
              {copied ? '✅ COPIED!' : '🔗 INVITE FRIENDS'}
            </button>
            <span className={`status-badge ${statusClasses[statusIndex]}`}>
              <span className="cd-status-dot" />
              {statusEmojis[statusIndex]} {statusLabels[statusIndex]}
            </span>
          </div>
        </header>

       
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
                  <span className={`cd-panel-value cd-timer ${isGraceExceeded ? 'timer-critical' : isLate ? 'timer-late' : ''}`}>
                    {isGraceExceeded 
                      ? '⚠️ NO GRACE' 
                      : isLate 
                        ? `⏱ GRACE: ${graceMinutes}m ${String(graceSeconds).padStart(2, '0')}s` 
                        : `⏱ ${minutesRemaining}m ${String(secondsRemaining).padStart(2, '0')}s`
                    }
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
                {state.members.map((member: string, idx: number) => {
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

            {/* Rescue / Admin actions */}
            <div className="cd-rescue">
              <div className="cd-rescue-header">
                <div className="cd-rescue-status-badge">
                  <span className={`cd-rescue-dot ${isLate ? 'dot-warn' : 'dot-active'}`} />
                  <span className="cd-rescue-status-text">{isLate ? 'RESCUE NEEDED' : 'MONITORING'}</span>
                </div>
                <span className="cd-rescue-title">Resolution Center</span>
              </div>
              <div className="cd-rescue-grid">
                <button 
                  className="cd-rescue-btn"
                  disabled={isTriggering || Number(state.contributorsThisRound) < requiredContributors}
                  onClick={() => triggerPayout(circleId)}
                  title={Number(state.contributorsThisRound) < requiredContributors 
                    ? `Waiting for all members to pay (${Number(state.contributorsThisRound)}/${requiredContributors})` 
                    : "Collect all funds and payout now"}
                >
                  💸 Trigger Payout
                  {isTriggering && <span className="cd-btn-spinner" />}
                </button>
                <button 
                  className="cd-rescue-btn cd-rescue-btn-danger"
                  disabled={isResolving || !isGraceExceeded}
                  onClick={() => resolveLateRound(circleId)}
                  title={!isGraceExceeded 
                    ? `Grace period ends in ${graceMinutes}m ${graceSeconds}s` 
                    : "A member defaulted. Use this to remove them and payout the collected funds."}
                >
                  ⚠️ Resolve Defaulters
                  {isResolving && <span className="cd-btn-spinner" />}
                </button>
              </div>
              {!isGraceExceeded && (
                <p className="cd-rescue-hint">
                  {isLate 
                    ? `Grace period ends in ${graceMinutes}m ${graceSeconds}s. Resolution will unlock then.` 
                    : "Buttons will activate if a member defaults or once all contributions are collected."}
                </p>
              )}
            </div>
          </>
        )}

        {statusIndex === 0 && (
          <div className="cd-waiting">
            <div className="cd-waiting-visual">
               <svg className="cd-waiting-svg" viewBox="0 0 100 100">
                  <circle className="cd-waiting-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="cd-waiting-progress" 
                    cx="50" cy="50" r="45" 
                    style={{ strokeDasharray: 283, strokeDashoffset: 283 - (283 * (state.members.length / Number(state.maxMembers))) }}
                  />
               </svg>
               <div className="cd-waiting-center">
                  <span className="cd-waiting-n">{state.members.length}</span>
                  <span className="cd-waiting-total">/ {Number(state.maxMembers)}</span>
               </div>
            </div>
            
            <div className="cd-waiting-content">
              <h3 className="cd-waiting-title">Awaiting Members</h3>
              <p className="cd-waiting-sub">
                This circle needs {Number(state.maxMembers) - state.members.length} more participant{Number(state.maxMembers) - state.members.length !== 1 ? 's' : ''} to activate.
              </p>
            </div>

            <div className="cd-waiting-actions">
              {!isMember ? (
                <button
                  onClick={() => joinCircle(circleId)}
                  disabled={isJoining}
                  className="btn btn-primary btn-large cd-join-btn"
                >
                  {isJoining
                    ? <><span className="cd-btn-spinner" /> Joining...</>
                    : <>➕ Join this Circle</>
                  }
                </button>
              ) : (
                <div className="cd-joined-status">
                  <div className="cd-joined-badge">
                    <span className="cd-check-circle">✓</span>
                    You're in the circle
                  </div>
                  <p className="cd-joined-desc">Invite others to join using Circle ID #{circleId}</p>
                </div>
              )}
            </div>
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
    display: flex; align-items: flex-start;
    justify-content: space-between;
    gap: 16px; flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .cd-header-left { display: flex; align-items: center; gap: 14px; }
  .cd-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

  .cd-invite-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 6px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .cd-invite-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
    border-color: rgba(255,255,255,0.2);
  }
  .cd-invite-btn.copied {
    background: rgba(16,185,129,0.1);
    border-color: rgba(16,185,129,0.3);
    color: #10b981;
  }

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
    padding: 60px 40px; gap: 32px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cd-waiting::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 120%, rgba(245,158,11,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .cd-waiting-visual {
    width: 140px; height: 140px;
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .cd-waiting-svg {
    width: 100%; height: 100%;
    transform: rotate(-90deg);
  }
  .cd-waiting-bg {
    fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 6;
  }
  .cd-waiting-progress {
    fill: none; stroke: #f59e0b; stroke-width: 6;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .cd-waiting-center {
    position: absolute;
    display: flex; flex-direction: column; align-items: center;
  }
  .cd-waiting-n { font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1; }
  .cd-waiting-total { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.3); margin-top: 4px; }
  
  .cd-waiting-content { display: flex; flex-direction: column; gap: 8px; }
  .cd-waiting-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin:0; letter-spacing: -0.02em; }
  .cd-waiting-sub {
    font-family: 'DM Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.4);
    max-width: 280px; line-height: 1.6; margin: 0;
  }

  .cd-waiting-actions { width: 100%; max-width: 320px; }
  
  .cd-joined-status {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .cd-joined-badge {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 40px;
    padding: 8px 18px;
    color: #10b981;
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 0.85rem;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  .cd-check-circle {
    width: 18px; height: 18px; background: #10b981; color: #0a0e14;
    border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
  }
  .cd-joined-desc {
    font-family: 'DM Mono', monospace; font-size: 0.65rem; color: rgba(255,255,255,0.25);
    letter-spacing: 0.05em; text-transform: uppercase; margin: 0;
  }

  /* Join Button override */
  .cd-join-btn {
    width: 100% !important;
    padding: 16px !important;
    font-size: 0.95rem !important;
  }

  .cd-btn-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
    border-radius: 50%; animation: cd-spin 0.7s linear infinite;
  }

  /* Success Message */
  .success-message {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: #10b981;
    margin-top: 12px;
    text-align: center;
  }

  /* Rescue UI */
  .cd-rescue {
    margin-top: 24px;
    padding: 20px;
    background: rgba(255,255,255, 0.02);
    border: 1px solid rgba(255,255,255, 0.06);
    border-radius: 18px;
    animation: cd-floatUp 0.4s ease both 0.3s;
  }
  .cd-rescue-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
  }
  .cd-rescue-status-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05);
    padding: 4px 10px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .cd-rescue-dot {
    width: 6px; height: 6px; border-radius: 50%;
  }
  .dot-active { background: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
  .dot-warn { background: #f59e0b; box-shadow: 0 0 8px rgba(245,158,11,0.4); animation: cd-pulse 1.5s infinite; }
  .cd-rescue-status-text {
    font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 600;
    color: rgba(255,255,255,0.5); letter-spacing: 0.05em;
  }
  .cd-rescue-title {
    font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.6);
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .cd-rescue-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .cd-rescue-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cd-rescue-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
  }
  .cd-rescue-btn-danger:hover:not(:disabled) {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    color: #ef4444;
  }
  .cd-rescue-btn:disabled {
    opacity: 0.3; cursor: not-allowed;
  }
  .cd-rescue-hint {
    margin-top: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.25);
    text-align: center;
  }

  /* Timer States */
  .timer-late { color: #f59e0b !important; }
  .timer-critical { color: #ef4444 !important; }

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