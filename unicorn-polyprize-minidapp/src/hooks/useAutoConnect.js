import { useState, useEffect } from 'react';
import { useConnectionStatus, useAddress } from "@thirdweb-dev/react";

export const useAutoConnect = () => {
  const connectionStatus = useConnectionStatus();
  const address = useAddress();
  const [isAutoConnected, setIsAutoConnected] = useState(false);
  const [connectionType, setConnectionType] = useState('');

  useEffect(() => {
    if (connectionStatus === "connected" && address) {
      const wasAutoConnected = localStorage.getItem('thirdweb:autoConnect') === 'true';
      setIsAutoConnected(wasAutoConnected);
      setConnectionType(wasAutoConnected ? 'Auto-Connected' : 'Manual Connection');
    } else if (connectionStatus === "disconnected") {
      setIsAutoConnected(false);
      setConnectionType('');
    }
  }, [connectionStatus, address]);

  return { isAutoConnected, connectionType };
};
