"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  unlockTime: Date;
}

export default function CountdownTimer({ unlockTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const unlockTimeMs = unlockTime.getTime();
      const difference = unlockTimeMs - now;

      if (difference <= 0) {
        setIsUnlocked(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [unlockTime]);

  if (isUnlocked) {
    return (
      <span className="text-green-500 font-bold flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        UNLOCKED
      </span>
    );
  }

  const formatTime = (value: number, label: string) => {
    if (value === 0) return null;
    return (
      <span key={label} className="inline-block">
        <span className="font-bold">{value}</span>
        <span className="text-xs ml-1">{label}</span>
      </span>
    );
  };

  const timeParts = [
    formatTime(timeLeft.days, 'd'),
    formatTime(timeLeft.hours, 'h'),
    formatTime(timeLeft.minutes, 'm'),
    formatTime(timeLeft.seconds, 's')
  ].filter(Boolean);

  if (timeParts.length === 0) {
    return (
      <span className="text-yellow-500 font-bold flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        UNLOCKING...
      </span>
    );
  }

  return (
    <span className="text-yellow-500 font-bold flex items-center">
      <Clock className="w-4 h-4 mr-2" />
      {timeParts.map((part, index) => (
        <span key={index}>
          {part}
          {index < timeParts.length - 1 && <span className="mx-1">:</span>}
        </span>
      ))}
    </span>
  );
}
