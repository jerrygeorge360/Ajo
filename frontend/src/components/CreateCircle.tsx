import { useState } from 'react';
import { useCreateCircle } from '../hooks/useAjo';

export function CreateCircle() {
  const [amount, setAmount] = useState('0.01');
  const [roundDurationSeconds, setRoundDurationSeconds] = useState('60');
  const [maxMembers, setMaxMembers] = useState('3');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { createCircle, isPending, isSuccess } = useCreateCircle();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCircle(amount, parseInt(roundDurationSeconds), parseInt(maxMembers));
  };

  const fields = [
    {
      id: 'amount',
      emoji: '💰',
      label: 'Contribution Amount',
      sublabel: 'per round',
      unit: 'FLOW',
      unitColor: '#00d4aa',
      type: 'number',
      step: '0.001',
      value: amount,
      onChange: (v: string) => setAmount(v),
      placeholder: '0.01',
      min: undefined,
      max: undefined,
    },
    {
      id: 'duration',
      emoji: '⏱',
      label: 'Round Duration',
      sublabel: 'per cycle',
      unit: 'SEC',
      unitColor: '#7c6af7',
      type: 'number',
      step: undefined,
      value: roundDurationSeconds,
      onChange: (v: string) => setRoundDurationSeconds(v),
      placeholder: '60',
      min: '60',
      max: undefined,
    },
    {
      id: 'members',
      emoji: '👥',
      label: 'Max Members',
      sublabel: 'in circle',
      unit: 'PPL',
      unitColor: '#f59e0b',
      type: 'number',
      step: undefined,
      value: maxMembers,
      onChange: (v: string) => setMaxMembers(v),
      placeholder: '3',
      min: '2',
      max: '20',
    },
  ];

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
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(0,212,170,0); }
          50%       { box-shadow: 0 0 24px rgba(0,212,170,0.25); }
        }
        @keyframes successSlide {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .cc-wrap {
          font-family: 'Syne', sans-serif;
          background: linear-gradient(160deg, #0f1218 0%, #0a0e14 60%, #0d1117 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          animation: floatUp 0.5s ease both;
        }

        .cc-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 20% 0%, rgba(0,212,170,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 100%, rgba(124,106,247,0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Animated top border */
        .cc-wrap::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4aa, #7c6af7, #f59e0b, #00d4aa);
          background-size: 300% 100%;
          animation: borderSpin 4s linear infinite;
          border-radius: 24px 24px 0 0;
        }

        .cc-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .cc-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,212,170,0.2), rgba(124,106,247,0.2));
          border: 1px solid rgba(0,212,170,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }

        .cc-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0;
        }

        .cc-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .cc-fields {
          display: grid;
          gap: 14px;
          margin-bottom: 24px;
        }

        .cc-field-wrap {
          position: relative;
          animation: floatUp 0.5s ease both;
        }
        .cc-field-wrap:nth-child(1) { animation-delay: 0.05s; }
        .cc-field-wrap:nth-child(2) { animation-delay: 0.10s; }
        .cc-field-wrap:nth-child(3) { animation-delay: 0.15s; }

        .cc-field-row {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .cc-field-row.focused {
          background: rgba(255,255,255,0.06);
          border-color: rgba(0,212,170,0.4);
          box-shadow: 0 0 0 3px rgba(0,212,170,0.08), inset 0 0 20px rgba(0,212,170,0.03);
        }

        .cc-field-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border-right: 1px solid rgba(255,255,255,0.06);
          min-width: 52px;
          gap: 2px;
        }
        .cc-field-emoji {
          font-size: 1.1rem;
          line-height: 1;
        }
        .cc-field-sublabel {
          font-family: 'DM Mono', monospace;
          font-size: 0.55rem;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .cc-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 1.25rem;
          font-weight: 500;
          padding: 16px 12px;
          width: 100%;
          -moz-appearance: textfield;
        }
        .cc-input::-webkit-outer-spin-button,
        .cc-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .cc-input::placeholder { color: rgba(255,255,255,0.15); }

        .cc-unit {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          padding: 0 16px;
          border-left: 1px solid rgba(255,255,255,0.06);
          white-space: nowrap;
          align-self: stretch;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .cc-field-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          font-weight: 400;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 7px;
          padding-left: 4px;
        }

        /* Submit button */
        .cc-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.2s;
          background: linear-gradient(135deg, #00d4aa 0%, #7c6af7 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(0,212,170,0.25);
        }
        .cc-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .cc-btn:hover:not(:disabled)::before { opacity: 1; }
        .cc-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,212,170,0.35);
        }
        .cc-btn:active:not(:disabled) { transform: translateY(0); }
        .cc-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cc-btn-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s ease infinite;
          position: absolute;
          inset: 0;
        }

        .cc-success {
          margin-top: 14px;
          padding: 14px 16px;
          background: rgba(0,212,170,0.08);
          border: 1px solid rgba(0,212,170,0.25);
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: successSlide 0.3s ease both;
        }
        .cc-success-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #00d4aa;
          box-shadow: 0 0 8px #00d4aa;
          flex-shrink: 0;
          animation: pulseGlow 2s ease infinite;
        }
        .cc-success-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #00d4aa;
          letter-spacing: 0.03em;
        }

        .cc-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          margin: 20px 0;
        }
      `}</style>

      <div className="cc-wrap">
        <div className="cc-header">
          <div className="cc-icon">🎪</div>
          <div>
            <h2 className="cc-title">Create New Circle</h2>
            <p className="cc-subtitle">Configure your savings round</p>
          </div>
        </div>

        <div className="cc-divider" />

        <form onSubmit={handleSubmit}>
          <div className="cc-fields">
            {fields.map((f) => (
              <div key={f.id} className="cc-field-wrap">
                <div className="cc-field-label">{f.label}</div>
                <div className={`cc-field-row${focusedField === f.id ? ' focused' : ''}`}>
                  <div className="cc-field-meta">
                    <span className="cc-field-emoji">{f.emoji}</span>
                    <span className="cc-field-sublabel">{f.sublabel}</span>
                  </div>
                  <input
                    type={f.type}
                    step={f.step}
                    min={f.min}
                    max={f.max}
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    onFocus={() => setFocusedField(f.id)}
                    onBlur={() => setFocusedField(null)}
                    className="cc-input"
                    placeholder={f.placeholder}
                    required
                  />
                  <span
                    className="cc-unit"
                    style={{ color: focusedField === f.id ? f.unitColor : 'rgba(255,255,255,0.25)' }}
                  >
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={isPending} className="cc-btn">
            {isPending && <span className="cc-btn-shimmer" />}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isPending ? '⏳  Creating Circle...' : '✦  Create Circle'}
            </span>
          </button>

          {isSuccess && (
            <div className="cc-success">
              <div className="cc-success-dot" />
              <span className="cc-success-text">Circle created successfully! Check the View Circle section below.</span>
            </div>
          )}
        </form>
      </div>
    </>
  );
}