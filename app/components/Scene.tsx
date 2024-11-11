'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import Carousel from './Carousel';

const Scene = () => {
  const window = globalThis.window;
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 0, 3],
          fov: 70,
          near: 0.1,
          far: 10,
        }}
      >
        <Carousel />
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
};

export default Scene;
