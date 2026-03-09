import { useState } from 'react';
import { useCreateCircle } from '../hooks/useAjo';

export function CreateCircle() {
  const [amount, setAmount] = useState('0.01');
  const [roundDurationSeconds, setRoundDurationSeconds] = useState('60');
  const [maxMembers, setMaxMembers] = useState('3');

  const { createCircle, isPending, isSuccess } = useCreateCircle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCircle(amount, parseInt(roundDurationSeconds), parseInt(maxMembers));
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
        }}>
          🎪
        </div>
        <h2 className="card-title" style={{ margin: 0 }}>Create New Circle</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label className="input-label">💰 Contribution Amount</label>
            <div className="input-with-unit">
              <input
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="0.01"
                required
              />
              <span className="input-unit">FLOW</span>
            </div>
          </div>

          <div>
            <label className="input-label">⏱️ Round Duration</label>
            <div className="input-with-unit">
              <input
                type="number"
                min="60"
                value={roundDurationSeconds}
                onChange={(e) => setRoundDurationSeconds(e.target.value)}
                className="input"
                placeholder="60"
                required
              />
              <span className="input-unit">seconds</span>
            </div>
          </div>

          <div>
            <label className="input-label">👥 Maximum Members</label>
            <div className="input-with-unit">
              <input
                type="number"
                min="2"
                max="20"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="input"
                placeholder="3"
                required
              />
              <span className="input-unit">people</span>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary btn-large" style={{ marginTop: '1rem' }}>
            {isPending ? '⏳ Creating...' : '✨ Create Circle'}
          </button>

          {isSuccess && (
            <div className="success-message">✅ Circle created successfully! Check the View Circle section below.</div>
          )}
        </div>
      </form>
    </div>
  );
}
