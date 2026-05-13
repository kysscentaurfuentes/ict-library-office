// frontend/src/hooks/useDynamicBackground.ts
import { useState, useEffect, useRef } from 'react';

// List of background images from 1 to 26
const backgroundImages = Array.from(
  { length: 26 },
  (_, i) => `${import.meta.env.BASE_URL}background-pictures/Bg${i + 1}.jpg`
);

export const useDynamicBackground = () => {
  const [currentBackground, setCurrentBackground] = useState<string>(backgroundImages[0]); // Start with Bg1.jpg
  const intervalRef = useRef<number | null>(null); // Pinalitan: NodeJS.Timeout → number

  // START DATE: Simula ngayon (Baguhin mo ito sa gusto mong start date)
  // Format: 'YYYY-MM-DD'
  const START_DATE = new Date('2026-05-11'); // CHANGE THIS TO YOUR START DATE
  
  // Function to get days since start date
  const getDaysSinceStart = (): number => {
    const now = new Date();
    // Remove time portion for accurate day counting
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Function to get background based on days since start date (sequence starting from Bg1)
  const getBackgroundBySequence = (): string => {
    const daysSinceStart = getDaysSinceStart();
    // Ensure positive number (kung negative, ibig sabihin before start date, use Bg1)
    const safeDays = Math.max(0, daysSinceStart);
    const index = safeDays % backgroundImages.length;
    console.log(`Day ${safeDays} → Background ${index + 1}: ${backgroundImages[index]}`);
    return backgroundImages[index];
  };

  // Update background based on current date
  const updateBackground = () => {
    const newBackground = getBackgroundBySequence();
    setCurrentBackground(newBackground);
  };

  // Setup background update at exactly 12:00 AM midnight (FIXED: walang memory leak)
  useEffect(() => {
    // Initial background set
    updateBackground();

    // Calculate time until next 12:00 AM
    const calculateTimeUntilMidnight = (): number => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next day 12:00 AM
      return midnight.getTime() - now.getTime();
    };

    // Set timeout to update at midnight
    const timeUntilMidnight = calculateTimeUntilMidnight();
    
    const midnightTimeout = setTimeout(() => {
      updateBackground(); // Update at midnight
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // After first midnight, set interval for every 24 hours
      intervalRef.current = setInterval(() => {
        updateBackground();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    // Cleanup: clear both timeout and interval on component unmount
    return () => {
      clearTimeout(midnightTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return currentBackground;
};