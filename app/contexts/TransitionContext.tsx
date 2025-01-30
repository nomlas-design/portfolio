'use client';
import { createContext, useContext, ReactNode, useRef, useState } from 'react';
import gsap from 'gsap';

interface TransitionContextType {
  activeIndex: number | null;
  progress: { value: number };
  isTransitioningPage: boolean;
  startTransition: (index: number | null) => void;
  setActiveIndex: (index: number | null) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTransitioningPage, setIsTransitioningPage] = useState(false);
  const progress = useRef({ value: 0 });
  const timeline = useRef<gsap.core.Timeline | null>(null);

  const startTransition = (index: number | null) => {
    // Kill any existing animation
    if (timeline.current) {
      timeline.current.kill();
    }

    setActiveIndex(index);
    setIsTransitioningPage(true);

    // Create new timeline
    timeline.current = gsap.timeline({
      onComplete: () => setIsTransitioningPage(false),
    });

    // Animate progress from 0 to 1
    progress.current.value = 0;
    timeline.current.to(progress.current, {
      value: 1,
      duration: 1.5,
      ease: 'power1.inOut',
    });
  };

  return (
    <TransitionContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        progress: progress.current,
        isTransitioningPage,
        startTransition,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}
