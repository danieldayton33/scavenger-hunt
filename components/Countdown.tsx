'use client';

import { useEffect, useState } from 'react';

export type CountdownProps = {
  /** The end date/time for the countdown */
  endAt: Date | string;
  /** Optional className for styling */
  className?: string;
  /** Optional callback when countdown reaches zero */
  onComplete?: () => void;
};

export default function Countdown({ endAt, className, onComplete }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const endDate = typeof endAt === 'string' ? new Date(endAt) : endAt;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endAt, onComplete]);

  if (timeRemaining === null) {
    return null;
  }

  if (timeRemaining.isExpired) {
    return (
      <div className={className}>
        <div className="text-lg font-semibold text-red-600">Hunt has ended</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{String(timeRemaining.days).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500">Days</div>
        </div>
        <div className="text-xl font-semibold text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{String(timeRemaining.hours).padStart(2, '0')}</div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
        <div className="text-xl font-semibold text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        <div className="text-xl font-semibold text-gray-400">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>
    </div>
  );
}

