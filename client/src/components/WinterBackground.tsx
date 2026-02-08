import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

export default function WinterBackground() {
  // Generate snowflakes with varying properties
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position (%)
      size: Math.random() * 3 + 2, // Size between 2-5px
      duration: Math.random() * 10 + 15, // Fall duration 15-25s
      delay: Math.random() * 5, // Stagger start times
      opacity: Math.random() * 0.4 + 0.3, // Opacity 0.3-0.7
      drift: Math.random() * 20 - 10, // Horizontal drift -10 to +10
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #1e1b4b 0%, #0f172a 100%)',
        zIndex: -1,
      }}
      aria-hidden="true"
    >
      {/* Snowfall particles */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, flake.drift, 0, -flake.drift, 0],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
            x: {
              duration: flake.duration * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}
    </div>
  );
}
