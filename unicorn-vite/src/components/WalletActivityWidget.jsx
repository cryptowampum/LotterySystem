export default function WalletActivityWidget({ activity, loading, address, ensName }) {
  if (loading) {
    return (
      <div className="bg-surface border border-accent rounded-lg p-4 mb-6 animate-pulse">
        <div className="h-4 bg-surface-muted rounded w-1/3 mb-3"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-8 bg-surface-muted rounded"></div>
          <div className="h-8 bg-surface-muted rounded"></div>
          <div className="h-8 bg-surface-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  return (
    <div className="bg-surface border border-accent rounded-lg p-4 mb-6">
      <p className="text-sm text-muted mb-3">
        Wallet Activity {displayName && <span className="font-semibold text-primary">({displayName})</span>}
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{activity.transactions}</p>
          <p className="text-xs text-muted">Transactions</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{activity.erc20}</p>
          <p className="text-xs text-muted">ERC-20</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{activity.nft}</p>
          <p className="text-xs text-muted">NFTs</p>
        </div>
      </div>
    </div>
  );
}
