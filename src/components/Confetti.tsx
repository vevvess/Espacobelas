import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  color: string;
}

const DEFAULT_COLORS: string[] = ['#fbbf24', '#f59e0b', '#10b981', '#059669'];

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

export function Confetti({
  isActive,
  duration = 1500,
  particleCount = 30,
  colors,
  onComplete
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Stabilize colors to avoid re-running effects due to new array references
  const colorsArray = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const colorsKey = useMemo(() => colorsArray.join(','), [colorsArray.join(',')]);

  // Keep the latest onComplete without re-running the main effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Criar partículas iniciais
    const initialParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentual da largura
      y: -10, // Começar acima da tela
      vx: (Math.random() - 0.5) * 2, // Velocidade horizontal
      vy: Math.random() * 2 + 1, // Velocidade vertical
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      size: Math.random() * 4 + 3, // 3-7px
      opacity: 1,
      color: colorsArray[Math.floor(Math.random() * colorsArray.length)]
    }));

    setParticles(initialParticles);

    // Animação das partículas
    const animationInterval = setInterval(() => {
      setParticles(prev =>
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vy: particle.vy + 0.1, // Gravidade
          opacity: Math.max(0, particle.opacity - 0.02) // Fade out gradual
        })).filter(p => p.y < 110 && p.opacity > 0) // Remove partículas que saíram da tela
      );
    }, 16); // ~60fps

    // Cleanup após duração
    const timeout = setTimeout(() => {
      clearInterval(animationInterval);
      setParticles([]);
      onCompleteRef.current?.();
    }, duration);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(timeout);
    };
  }, [isActive, duration, particleCount, colorsKey]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-20">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
            transition: 'none'
          }}
        />
      ))}
    </div>
  );
}

// Componente de partículas mais simples para dispositivos com motion reduzido
export function SimpleConfetti({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  useEffect(() => {
    if (isActive && onComplete) {
      const timeout = setTimeout(onComplete, 300);
      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none rounded-lg z-20">
      <div className="absolute inset-0 bg-gradient-radial from-yellow-400/30 via-green-400/20 to-transparent animate-ping" />
    </div>
  );
}
