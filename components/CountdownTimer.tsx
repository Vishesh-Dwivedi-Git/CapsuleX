"use client";

import { useState, useEffect } from 'react';

// Types
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  unlockTime: Date;
}

// A reusable component to display a countdown timer for each capsule
export default function CountdownTimer({ unlockTime }: CountdownTimerProps) {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = unlockTime.getTime() - new Date().getTime();
        
        if (difference <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            
            // Clear interval if countdown is complete
            if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
                newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(timer);
    }, [unlockTime]);

    // Check if countdown is complete
    const isComplete = timeLeft.days === 0 && timeLeft.hours === 0 && 
                      timeLeft.minutes === 0 && timeLeft.seconds === 0;

    if (isComplete) {
        return (
            <div className="font-mono text-sm text-green-500">
                Ready to Unlock!
            </div>
        );
    }

    const formatTimeUnit = (value: number, unit: string): string => {
        return `${String(value).padStart(2, '0')}${unit.charAt(0)}`;
    };

    return (
        <div className="font-mono text-sm text-yellow-500 space-x-1">
            {timeLeft.days > 0 && (
                <span>{formatTimeUnit(timeLeft.days, 'days')}</span>
            )}
            {timeLeft.days > 0 && <span>:</span>}
            <span>{formatTimeUnit(timeLeft.hours, 'hours')}</span>
            <span>:</span>
            <span>{formatTimeUnit(timeLeft.minutes, 'minutes')}</span>
            <span>:</span>
            <span>{formatTimeUnit(timeLeft.seconds, 'seconds')}</span>
        </div>
    );
}
