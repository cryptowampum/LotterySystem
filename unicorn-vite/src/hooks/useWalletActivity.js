import { useState, useEffect } from 'react';

export default function useWalletActivity(address) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      setActivity(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch('/api/wallet-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setActivity(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[WalletActivity] fetch failed:', err.message);
        if (!cancelled) {
          setActivity(null);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [address]);

  return { activity, loading };
}
