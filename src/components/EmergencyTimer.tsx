import React, { useState, useEffect, useMemo } from 'react';
import { Timer } from 'lucide-react';

interface EmergencyTimerProps {
  startTime?: number;
  className?: string;
}

export const EmergencyTimer: React.FC<EmergencyTimerProps> = ({
  startTime = Date.now(),
  className = ""
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const elapsedSeconds = useMemo(() => {
    return Math.floor((currentTime - startTime) / 1000);
  }, [currentTime, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (elapsedSeconds < 60) return 'text-emerald-600 dark:text-emerald-400';
    if (elapsedSeconds < 300) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 1000);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className={`emergency-timer flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <Timer
          className={`h-6 w-6 ${getTimerColor()} ${isPulsing ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
        <div
          className={`absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ${isPulsing ? 'animate-ping' : ''}`}
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Tiempo de emergencia
        </span>
        <span
          className={`text-2xl font-bold tabular-nums ${getTimerColor()}`}
          role="timer"
          aria-label={`Tiempo transcurrido: ${formatTime(elapsedSeconds)}`}
        >
          {formatTime(elapsedSeconds)}
        </span>
      </div>
    </div>
  );
};