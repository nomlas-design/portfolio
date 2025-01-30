import { Text, shaderMaterial } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import {
  backgroundFragmentShader as fragmentShader,
  backgroundVertexShader as vertexShader,
} from '../shaders/backgroundShaders';

interface CarouselTextLineProps {
  position: [number, number, number];
  colour: string;
}

const Background = ({ position, colour }: CarouselTextLineProps) => {
  const textRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [size, setSize] = useState([0, 0]);
  const { viewport } = useThree();

  // Add Leva controls for colors
  const { color1, color2, color3 } = useControls('Background Colors', {
    color1: {
      value: '#1A1410', // Dark brown-black
      label: 'Dark Brown-Black',
    },
    color2: {
      value: '#261E17', // Slightly lighter brown-black
      label: 'Lighter Brown-Black',
    },
    color3: {
      value: '#0D0A08', // Darkest black
      label: 'Darkest Black',
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setSize([viewport.width, viewport.height]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewport, setSize]);

  // Update uniforms when colors change

  const BackgroundMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uColour: new THREE.Color('#ebece9'),
        uTime: 0,
        uColor1: new THREE.Vector3(0.918, 0.267, 0.122), // Primary red #EA441F
        uColor2: new THREE.Vector3(1.0, 0.486, 0.333), // More intense orange #FF7C55
        uColor3: new THREE.Vector3(1.0, 0.392, 0.255),
      },
      vertexShader,
      fragmentShader,
      (material) => {
        if (material) {
          // material.transparent = true;
          // material.side = THREE.DoubleSide;
        }
      }
    );
  }, []);

  extend({ BackgroundMaterial });

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry
        args={[viewport.width + viewport.width, viewport.height * 2]}
      />
      <backgroundMaterial ref={materialRef} />
    </mesh>
  );
};

export default Background;
