import { useState, useEffect } from 'react';

export const useCountdown = (targetTimestamp) => {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!targetTimestamp) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const drawingTimestamp = parseInt(targetTimestamp.toString());
      const timeLeft = drawingTimestamp - now;
      
      if (timeLeft <= 0) {
        setCountdown("Drawing has ended");
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(timeLeft / 86400);
      const hours = Math.floor((timeLeft % 86400) / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return countdown;
};
