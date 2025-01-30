import { Text, shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { textFragmentShader, textVertexShader } from '../shaders/textShaders';
import gsap from 'gsap';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

interface CarouselTextLineProps {
  text: string;
  position: [number, number, number];
  index: number;
  onWidthComputed: (index: number, width: number) => void;
  opacity: number;
  anchorX: number | 'center' | 'right' | 'left' | undefined;
  expanded: boolean;
  duration: number;
  delay: number;
  isDirectLoad: boolean;
  setIsDirectLoad: (value: boolean) => void;
}

const CarouselTextLine = ({
  text,
  position,
  index,
  onWidthComputed,
  opacity,
  anchorX,
  expanded,
  duration,
  delay,
  isDirectLoad,
  setIsDirectLoad,
}: CarouselTextLineProps) => {
  const textRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const TextMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uColour: new THREE.Color('#ebece9'),
        uOpacity: opacity,
        uFadeStart: 2.0,
        uFadeEnd: 4.0,
        uTransition: 0.0,
        uTransitionDuration: duration,
      },
      textVertexShader,
      textFragmentShader,
      (material) => {
        if (material) {
          material.transparent = true;
          material.side = THREE.DoubleSide;
        }
      }
    );
  }, [opacity, duration]);

  extend({ TextMaterial });

  const handleSync = (mesh: THREE.Mesh) => {
    mesh.geometry.computeBoundingBox();
    if (mesh.geometry.boundingBox) {
      const { boundingBox } = mesh.geometry;
      const width = boundingBox.max.x - boundingBox.min.x;
      onWidthComputed(index, width);
    }
  };

  useEffect(() => {
    if (!materialRef.current) return;
    const uniforms = materialRef.current.uniforms;

    if (isDirectLoad) {
      uniforms.uTransition.value = expanded ? 1.0 : 0.0;
    } else {
      gsap.to(uniforms.uTransition, {
        value: expanded ? 1.0 : 0.0,
        duration: duration * 0.5,
        ease: 'power2.inOut',
        delay: delay,
      });
    }
    // setIsDirectLoad(false);
  }, [expanded, duration, delay, isDirectLoad]);

  return (
    <Text
      ref={textRef}
      fontSize={0.6}
      font='/fonts/HelveticaNowDisplay-Bold.woff'
      anchorX={anchorX}
      anchorY='middle'
      position={position}
      onSync={handleSync}
    >
      <textMaterial
        ref={materialRef}
        transparent
        uColour={new THREE.Color('#ebece9')}
        uOpacity={opacity}
        uFadeStart={-5.0}
        uFadeEnd={10}
        uTransition={0.0}
        uTransitionDuration={duration}
      />
      {text.toUpperCase()}
    </Text>
  );
};

export default CarouselTextLine;
