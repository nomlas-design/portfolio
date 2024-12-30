'use client';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
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
import Underlay from './Underlay';

const Scene = () => {
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
        <Carousel />

        {/* <OrbitControls /> */}
        <EffectComposer>
          <Noise premultiply />
        </EffectComposer>
        <ambientLight intensity={0.5} />

        {/* Add Directional Light */}
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Optionally, add a Point Light for more dynamic lighting */}
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default Scene;
