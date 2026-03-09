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
    if (joinSuccess) {
      refetch();
    }
  }, [joinSuccess, refetch]);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 4000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return <div className="card">Loading circle data...</div>;
  if (!state) return <div className="card">Circle not found</div>;

  const statusText = ['Open', 'Active', 'Completed'][state.status];
  const statusClass = ['status-open', 'status-active', 'status-completed'][state.status];
  const isMember = state.members.some((m) => m.toLowerCase() === address?.toLowerCase());
  const isCurrentRecipient = state.nextRecipient?.toLowerCase() === address?.toLowerCase();
  const requiredContributors = Math.max(0, state.members.length - 1);
  const roundEndTime = Number(state.roundStartTime) + Number(state.roundDuration);
  const timeRemaining = Math.max(0, roundEndTime - nowTs);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = timeRemaining % 60;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #10b981, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            📊
          </div>
          <h2 className="card-title" style={{ margin: 0 }}>
            Circle #{circleId}
          </h2>
        </div>
        <span className={`status-badge ${statusClass}`}>{statusText}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="stat-badge">
          <span className="stat-value">{formatEther(state.contributionAmount)}</span>
          <span className="stat-label">FLOW per round</span>
        </div>
        <div className="stat-badge">
          <span className="stat-value">
            {state.members.length} / {Number(state.maxMembers)}
          </span>
          <span className="stat-label">Members</span>
        </div>
      </div>

      {state.status === 1 && (
        <>
          <div
            style={{
              background: '#fafafa',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.9rem' }}>Round Progress</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  {Number(state.currentRound) + 1} of {state.members.length}
                </div>
              </div>

              <div>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.9rem' }}>Next Recipient</span>
                <div style={{ fontSize: '1rem', fontFamily: 'monospace', marginTop: '0.25rem', color: '#111111' }}>
                  {state.nextRecipient?.slice(0, 10)}...{state.nextRecipient?.slice(-8)}
                </div>
              </div>

              <div>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.9rem' }}>Time Remaining</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  ⏱️ {minutesRemaining}m {secondsRemaining}s
                </div>
              </div>

              <div>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.9rem' }}>Contributions</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  {Number(state.contributorsThisRound)} / {requiredContributors}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '4px',
                    marginTop: '0.5rem',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${requiredContributors === 0 ? 0 : Math.min(100, (Number(state.contributorsThisRound) / requiredContributors) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #111111, #52525b)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>👥 Members</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {state.members.map((member, idx) => (
                <div
                  key={member}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background:
                      idx === Number(state.currentRound) ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '8px',
                    border: `1px solid ${
                      idx === Number(state.currentRound) ? 'rgba(0, 0, 0, 0.18)' : 'rgba(0, 0, 0, 0.08)'
                    }`,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {member.slice(0, 8)}...{member.slice(-6)}
                  </span>
                  {idx === Number(state.currentRound) && (
                    <span
                      style={{
                        background: 'rgba(0, 0, 0, 0.08)',
                        color: '#111111',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      🎯 Receiving
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isMember && !isCurrentRecipient && (
            <ContributeButton
              circleId={circleId}
              contributionAmount={formatEther(state.contributionAmount)}
              hasContributed={hasContributed || false}
              onSuccess={() => refetch()}
            />
          )}
          {isMember && isCurrentRecipient && (
            <div className="success-message">🎯 You are this round's recipient. You do not contribute this round.</div>
          )}
        </>
      )}

      {state.status === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgba(0, 0, 0, 0.7)' }}>
            ⏳ Waiting for members to join...
          </p>
          {!isMember && (
            <button onClick={() => joinCircle(circleId)} disabled={isJoining} className="btn btn-primary btn-large">
              {isJoining ? '⏳ Joining...' : '➕ Join Circle'}
            </button>
          )}
          {isMember && (
            <div className="success-message">
              ✅ You are a member! Waiting for {Number(state.maxMembers) - state.members.length} more member(s).
            </div>
          )}
        </div>
      )}

      {state.status === 2 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#111111', marginBottom: '0.5rem' }}>
            Circle Completed!
          </p>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)' }}>All members have received their payout.</p>
        </div>
      )}
    </div>
  );
}
