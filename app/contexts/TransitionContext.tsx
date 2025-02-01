'use client';
import { createContext, useContext, ReactNode, useRef, useState } from 'react';
import gsap from 'gsap';
import { set } from 'sanity';

interface TransitionContextType {
  activeIndex: number | null; // Target index for the transition (null for transition out)
  displayedIndex: number | null; // Index that remains mounted until the transition completes
  progress: number; // Tweened value (0 → 1)
  transitionDirection: 'in' | 'out'; // Transition direction flag
  transitioning: boolean; // Flag to indicate if a transition is in progress
  startTransition: (index: number | null) => void;
  setActiveIndex: (index: number | null) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(
  undefined
);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'in' | 'out'>(
    'in'
  );

  // Maintain a persistent tween object for GSAP
  const tweenObj = useRef({ value: 0 }).current;

  const startTransition = (index: number | null) => {
    setTransitioning(true);
    if (index !== null) {
      // Transitioning IN:
      // • Mount the component by setting displayedIndex.
      // • Set the target activeIndex.
      setDisplayedIndex(index);
      setActiveIndex(index);
      setTransitionDirection('in');
      tweenObj.value = progress; // Start tweening from current progress value
      gsap.to(tweenObj, {
        value: 1, // Tween from current value to 1
        duration: 1,
        ease: 'power2.inOut',
        onUpdate() {
          setProgress(tweenObj.value); // Update progress state for components
        },
      });
    } else {
      // Transitioning OUT:
      // • Change activeIndex to null to signal a transition out.
      // • Keep displayedIndex until the tween completes.
      setActiveIndex(null);
      setTransitionDirection('out');
      tweenObj.value = progress;
      gsap.to(tweenObj, {
        value: 0, // Tween from current value to 0
        duration: 1,
        ease: 'power2.inOut',
        onUpdate() {
          setProgress(tweenObj.value);
        },
        onComplete() {
          // Unmount component only after tween-out completes
          setDisplayedIndex(null);
        },
      });
      setTransitioning(false);
    }
  };

  return (
    <TransitionContext.Provider
      value={{
        activeIndex,
        displayedIndex,
        progress,
        transitioning,
        transitionDirection,
        startTransition,
        setActiveIndex,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}
