'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { useState, useEffect, useRef } from 'react';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  ColorAverage,
  Noise,
  Vignette,
  Sepia,
  DotScreen,
  ChromaticAberration,
  SelectiveBloom,
  ToneMapping,
  Scanline,
} from '@react-three/postprocessing';
import { BlendFunction, BlurPass, Resizer, KernelSize } from 'postprocessing';
import Carousel from './Carousel';
import Background from './Background';
import { useTransition } from '@/app/contexts/TransitionContext';

const Scene = () => {
  const pathname = usePathname();
  const hasHandledInitialLoad = useRef(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [isDirectLoad, setIsDirectLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { isTransitioning } = useTransition();

  useEffect(() => {
    if (hasHandledInitialLoad.current) {
      setSlug(
        pathname?.startsWith('/projects/') ? pathname.split('/')[2] : null
      );
      setIsReady(true);
      return;
    }

    if (pathname && pathname.startsWith('/projects/')) {
      const parts = pathname.split('/');
      setSlug(parts[2]);
      setIsDirectLoad(true);
    } else {
      setSlug(null);
      setIsDirectLoad(false);
    }

    hasHandledInitialLoad.current = true;
    setIsReady(true);
  }, [pathname, hasHandledInitialLoad, setSlug, setIsDirectLoad, setIsReady]);

  if (!isReady) return null; // Gate rendering until we have final values

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 0, 6],
          fov: 30,
          near: 0.1,
          far: 20,
        }}
      >
        <Background position={[0, 0, -5]} colour='red' />
        <Carousel
          slug={slug}
          isDirectLoad={isDirectLoad}
          setIsDirectLoad={setIsDirectLoad}
          isTransitioning={isTransitioning}
        />
      </Canvas>
    </div>
  );
};

export default Scene;
