import { useState, useEffect, useCallback } from 'react';

interface CinematicTextProps {
  /** Array of "thoughts". Each thought is an array of lines that type out sequentially and display together. */
  thoughts: string[][];
  className?: string;
  typingSpeedMin?: number;
  typingSpeedMax?: number;
  /** How long the full thought stays visible before fading (ms) */
  waitDuration?: number;
  /** Fade-out duration (ms) */
  fadeDuration?: number;
  /** Pause between finishing one line and starting the next within a thought (ms) */
  linePause?: number;
}

const CinematicText = ({
  thoughts,
  className = '',
  typingSpeedMin = 40,
  typingSpeedMax = 120,
  waitDuration = 4000,
  fadeDuration = 1000,
  linePause = 400,
}: CinematicTextProps) => {
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'line-pause' | 'waiting' | 'fading'>('typing');
  /** Stores fully typed lines for the current thought */
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  const currentThought = thoughts[thoughtIndex] ?? [];
  const currentLine = currentThought[lineIndex] ?? '';

  const resetToNextThought = useCallback(() => {
    setCompletedLines([]);
    setLineIndex(0);
    setCharIndex(0);
    setThoughtIndex((prev) => (prev + 1) % thoughts.length);
    setPhase('typing');
  }, [thoughts.length]);

  useEffect(() => {
    if (thoughts.length === 0) return;

    if (phase === 'typing') {
      if (charIndex < currentLine.length) {
        const delay = Math.random() * (typingSpeedMax - typingSpeedMin) + typingSpeedMin;
        const timeout = setTimeout(() => setCharIndex((c) => c + 1), delay);
        return () => clearTimeout(timeout);
      } else {
        // Line finished typing
        if (lineIndex < currentThought.length - 1) {
          // More lines to go — brief pause then advance
          setPhase('line-pause');
        } else {
          // All lines typed — hold the thought
          setCompletedLines((prev) => [...prev, currentLine]);
          setPhase('waiting');
        }
      }
    } else if (phase === 'line-pause') {
      const timeout = setTimeout(() => {
        setCompletedLines((prev) => [...prev, currentLine]);
        setLineIndex((l) => l + 1);
        setCharIndex(0);
        setPhase('typing');
      }, linePause);
      return () => clearTimeout(timeout);
    } else if (phase === 'waiting') {
      const timeout = setTimeout(() => setPhase('fading'), waitDuration);
      return () => clearTimeout(timeout);
    } else if (phase === 'fading') {
      const timeout = setTimeout(resetToNextThought, fadeDuration);
      return () => clearTimeout(timeout);
    }
  }, [
    phase, charIndex, lineIndex, thoughtIndex,
    currentLine, currentThought.length, thoughts.length,
    typingSpeedMin, typingSpeedMax, waitDuration, fadeDuration, linePause,
    resetToNextThought,
  ]);

  return (
    <div
      className={`${className} transition-opacity ease-in-out`}
      style={{ transitionDuration: `${fadeDuration}ms`, opacity: phase === 'fading' ? 0 : 1 }}
    >
      {/* Already completed lines */}
      {completedLines.map((line, i) => (
        <div key={i}>{line} ·</div>
      ))}

      {/* Currently typing line (only if not yet added to completedLines) */}
      {phase !== 'waiting' && phase !== 'fading' && (
        <div>
          {currentLine.slice(0, charIndex)}
          <span className="animate-pulse text-accent">_</span>
        </div>
      )}
    </div>
  );
};

export default CinematicText;
