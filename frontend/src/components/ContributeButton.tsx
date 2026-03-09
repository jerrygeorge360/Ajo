import { useEffect } from 'react';
import { useContribute } from '../hooks/useAjo';

interface Props {
  circleId: number;
  contributionAmount: string;
  hasContributed: boolean;
  onSuccess?: () => void;
}

export function ContributeButton({ circleId, contributionAmount, hasContributed, onSuccess }: Props) {
  const { contribute, isPending, isSuccess } = useContribute();

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <button
        onClick={() => contribute(circleId, contributionAmount)}
        disabled={isPending || hasContributed}
        className={`btn ${hasContributed ? 'btn-secondary' : 'btn-success'} btn-large`}
        style={{ width: '100%' }}
      >
        {hasContributed ? (
          <>
            <span>✅</span>
            <span>Already Contributed</span>
          </>
        ) : isPending ? (
          <>
            <span>⏳</span>
            <span>Contributing...</span>
          </>
        ) : (
          <>
            <span>💸</span>
            <span>Contribute {contributionAmount} FLOW</span>
          </>
        )}
      </button>

      {isSuccess && <div className="success-message">✅ Contribution successful! Transaction confirmed.</div>}
    </div>
  );
}
